import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import classNames from 'classnames';
import {getEventXY} from '../../lib/touch-utils';
import {getSliderPosition, getWheelValue, getWheelDelta} from '../../lib/color-picker-position';

import styles from './slider.css';

const CONTAINER_WIDTH = 150;
const HANDLE_WIDTH = 26;

class SliderComponent extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleMouseDown',
            'handleMouseUp',
            'handleMouseMove',
            'handleModifiers',
            'handleWheel',
            'setBackground',
            'setHandle'
        ]);

        // Distance from the left edge of the slider handle to the mouse down/click event
        this.handleClickOffset = 0;
    }

    componentWillUnmount () {
        this.handleMouseUp();
        this.setBackground(null);
    }

    handleMouseDown (event) {
        if (typeof event.button === 'number' && event.button !== 0) return;
        if (this.dragging) return;
        event.preventDefault();
        this.dragging = true;
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('touchmove', this.handleMouseMove, {passive: false});
        document.addEventListener('touchend', this.handleMouseUp);
        document.addEventListener('touchcancel', this.handleMouseUp);
        window.addEventListener('blur', this.handleMouseUp);
        window.addEventListener('keydown', this.handleModifiers);
        window.addEventListener('keyup', this.handleModifiers);

        this.handleClickOffset = event.target === this.background ? HANDLE_WIDTH / 2 :
            getEventXY(event).x - this.handle.getBoundingClientRect().left;
        this.handleMouseMove(event);
    }

    handleMouseUp () {
        this.dragging = false;
        this.lastPointer = null;
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('touchmove', this.handleMouseMove, {passive: false});
        document.removeEventListener('touchend', this.handleMouseUp);
        document.removeEventListener('touchcancel', this.handleMouseUp);
        window.removeEventListener('blur', this.handleMouseUp);
        window.removeEventListener('keydown', this.handleModifiers);
        window.removeEventListener('keyup', this.handleModifiers);
    }

    handleMouseMove (event) {
        event.preventDefault();
        const {x, y} = getEventXY(event);
        this.lastPointer = {clientX: x, clientY: y};
        this.props.onChange(this.scaleMouseToSliderPosition(event));
    }

    handleModifiers (event) {
        if (event.key !== 'Control' || !this.lastPointer) return;
        this.props.onChange(this.scaleMouseToSliderPosition({...this.lastPointer, ctrlKey: event.ctrlKey}));
    }

    scaleMouseToSliderPosition (event){
        const {x} = getEventXY(event);
        const backgroundBBox = this.background.getBoundingClientRect();
        return getSliderPosition(x, backgroundBBox, this.handleClickOffset,
            this.props.betterColorPicker && event.ctrlKey);
    }

    setBackground (ref) {
        if (this.background) this.background.removeEventListener('wheel', this.handleWheel);
        this.background = ref;
        if (ref) ref.addEventListener('wheel', this.handleWheel, {passive: false});
    }

    handleWheel (event) {
        const delta = getWheelDelta(event);
        if (!delta) return;
        event.preventDefault();
        this.props.onChange(getWheelValue(this.props.value, delta,
            this.props.betterColorPicker && event.ctrlKey));
    }

    setHandle (ref) {
        this.handle = ref;
    }

    render () {
        const halfHandleWidth = HANDLE_WIDTH / 2;
        const pixelMin = halfHandleWidth;
        const pixelMax = CONTAINER_WIDTH - halfHandleWidth;
        const handleOffset = pixelMin +
            ((pixelMax - pixelMin) * (this.props.value / 100)) -
            halfHandleWidth;
        return (
            <div
                className={classNames({
                    [styles.container]: true,
                    [styles.last]: this.props.lastSlider
                })}
                ref={this.setBackground}
                style={{
                    backgroundImage: this.props.background
                }}
                onMouseDown={this.handleMouseDown}
                onTouchStart={this.handleMouseDown}
            >
                <div
                    className={styles.handle}
                    ref={this.setHandle}
                    style={{
                        left: `${handleOffset}px`
                    }}
                />
            </div>
        );
    }
}

SliderComponent.propTypes = {
    betterColorPicker: PropTypes.bool,
    background: PropTypes.string,
    lastSlider: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.number.isRequired
};

SliderComponent.defaultProps = {
    background: 'yellow'
};

export default SliderComponent;
export {CONTAINER_WIDTH, HANDLE_WIDTH};
