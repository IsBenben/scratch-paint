import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import Input from '../forms/input.jsx';
import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import {getWheelValue, getWheelDelta} from '../../lib/color-picker-position';

import styles from './tw-color-readout.css';

const BufferedInput = BufferedInputHOC(Input);

class TWColorReadout extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleSubmit', 'handleWheel', 'setElement', 'setInput'
        ]);
    }
    componentWillUnmount () {
        this.setElement(null);
    }
    setElement (element) {
        if (this.element) this.element.removeEventListener('wheel', this.handleWheel);
        this.element = element;
        if (element) element.addEventListener('wheel', this.handleWheel, {passive: false});
    }
    setInput (input) {
        this.input = input;
    }
    handleWheel (event) {
        const delta = getWheelDelta(event);
        if (!delta) return;
        event.preventDefault();
        const current = this.element.querySelector('input').value;
        const value = current.trim() && Number.isFinite(Number(current)) ? Number(current) : this.props.value;
        this.input.setState({value: null});
        this.props.onChange(getWheelValue(value, delta, this.props.betterColorPicker && event.ctrlKey));
    }
    handleSubmit (value) {
        if (!isNaN(value)) {
            this.props.onChange(Math.min(100, Math.max(0, +value || 0)));
        }
    }
    render () {
        return (
            <span ref={this.setElement}>
                <BufferedInput
                    ref={this.setInput}
                    className={styles.readout}
                    onSubmit={this.handleSubmit}
                    value={Math.round(this.props.value * 10) / 10}
                    type="number"
                    step="any"
                    min={0}
                    max={100}
                />
            </span>
        );
    }
}

TWColorReadout.propTypes = {
    betterColorPicker: PropTypes.bool,
    value: PropTypes.number,
    onChange: PropTypes.func
};

export default TWColorReadout;
