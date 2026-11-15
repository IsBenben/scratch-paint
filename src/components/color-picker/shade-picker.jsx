import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import parseColor from 'parse-color';
import TWColorReadout from '../tw-color-readout/tw-color-readout.jsx';
import {getShadePosition, getWheelShadePosition} from '../../lib/color-picker-position';
import pickerStyles from './color-picker.css';
import sliderStyles from '../forms/slider.css';
import styles from './shade-picker.css';

class ShadePicker extends React.Component {
    constructor (props) {
        super(props);
        this.state = {axis: 'both'};
        bindAll(this, [
            'handlePointerDown', 'handlePointerMove', 'handlePointerUp', 'handlePointerLeave',
            'handleModifiers', 'stopDragging', 'handleBlur', 'setArea', 'handleWheel'
        ]);
    }
    componentDidMount () {
        window.addEventListener('keydown', this.handleModifiers);
        window.addEventListener('keyup', this.handleModifiers);
        window.addEventListener('blur', this.handleBlur);
    }
    componentWillUnmount () {
        this.stopDragging();
        this.setArea(null);
        window.removeEventListener('keydown', this.handleModifiers);
        window.removeEventListener('keyup', this.handleModifiers);
        window.removeEventListener('blur', this.handleBlur);
    }
    setArea (area) {
        if (this.area) this.area.removeEventListener('wheel', this.handleWheel);
        this.area = area;
        if (area) area.addEventListener('wheel', this.handleWheel, {passive: false});
    }
    handleWheel (event) {
        if (!event.deltaX && !event.deltaY) return;
        event.preventDefault();
        const {saturation, brightness} = getWheelShadePosition(event, this.props,
            this.props.betterColorPicker && event.ctrlKey);
        this.props.onChange(saturation, brightness);
    }
    updatePointer (event, shift = event.shiftKey, ctrl = event.ctrlKey) {
        this.lastPointer = {clientX: event.clientX, clientY: event.clientY};
        const position = getShadePosition(
            this.lastPointer,
            this.area.getBoundingClientRect(),
            this.dragging ? this.origin : this.props,
            shift,
            ctrl && this.props.betterColorPicker
        );
        this.setState({axis: position.axis});
        if (this.dragging) this.props.onChange(position.saturation, position.brightness);
    }
    handlePointerDown (event) {
        if (event.button !== 0 || this.dragging) return;
        event.preventDefault();
        this.origin = {saturation: this.props.saturation, brightness: this.props.brightness};
        this.dragging = true;
        this.pointerId = event.pointerId;
        window.addEventListener('pointermove', this.handlePointerMove);
        window.addEventListener('pointerup', this.handlePointerUp);
        window.addEventListener('pointercancel', this.stopDragging);
        this.updatePointer(event);
    }
    handlePointerMove (event) {
        if (this.dragging && event.pointerId !== this.pointerId) return;
        if (this.dragging) event.preventDefault();
        this.updatePointer(event);
    }
    handlePointerUp (event) {
        if (event.pointerId !== this.pointerId) return;
        this.updatePointer(event);
        this.stopDragging();
    }
    handlePointerLeave () {
        if (this.dragging) return;
        this.lastPointer = null;
        this.setState({axis: 'both'});
    }
    handleModifiers (event) {
        if (this.lastPointer) this.updatePointer(this.lastPointer, event.shiftKey, event.ctrlKey);
    }
    stopDragging () {
        this.dragging = false;
        window.removeEventListener('pointermove', this.handlePointerMove);
        window.removeEventListener('pointerup', this.handlePointerUp);
        window.removeEventListener('pointercancel', this.stopDragging);
    }
    handleBlur () {
        this.stopDragging();
        this.lastPointer = null;
        this.setState({axis: 'both'});
    }
    render () {
        const hueColor = parseColor(`hsv(${this.props.hue * 3.6}, 100, 100)`).hex;
        return (
            <div className={pickerStyles.row}>
                <div className={`${pickerStyles.rowHeader} sa-2dcolor-label`}>
                    <span className={pickerStyles.labelName}>{this.props.label}</span>
                    <span className={styles.readout}>
                        <TWColorReadout
                            betterColorPicker={this.props.betterColorPicker}
                            value={this.props.saturation}
                            onChange={this.props.onSaturationChange}
                        />
                        <TWColorReadout
                            betterColorPicker={this.props.betterColorPicker}
                            value={this.props.brightness}
                            onChange={this.props.onBrightnessChange}
                        />
                    </span>
                </div>
                <div
                    className={`${styles.area} sa-2dcolor-picker`}
                    data-sa-color-picker-axis={this.state.axis}
                    ref={this.setArea}
                    style={{
                        backgroundColor: hueColor,
                        backgroundImage: 'linear-gradient(to top, #000, transparent), ' +
                            'linear-gradient(to right, #fff, transparent)'
                    }}
                    onPointerDown={this.handlePointerDown}
                    onPointerMove={this.dragging ? null : this.handlePointerMove}
                    onPointerEnter={this.handlePointerMove}
                    onPointerLeave={this.handlePointerLeave}
                >
                    <div
                        className={`${sliderStyles.handle} ${styles.handle}`}
                        style={{left: `${this.props.saturation}%`, top: `${100 - this.props.brightness}%`}}
                    />
                </div>
            </div>
        );
    }
}

ShadePicker.propTypes = {
    betterColorPicker: PropTypes.bool,
    brightness: PropTypes.number.isRequired,
    hue: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    onBrightnessChange: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onSaturationChange: PropTypes.func.isRequired,
    saturation: PropTypes.number.isRequired
};

export default ShadePicker;
