class RecorderProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input.length > 0) {
            // Send mono channel back to main thread
            this.port.postMessage({
                type: 'data',
                samples: input[0]
            });
        }
        return true;
    }
}

registerProcessor('recorder-processor', RecorderProcessor);