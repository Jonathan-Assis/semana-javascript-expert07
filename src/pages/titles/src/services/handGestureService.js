import { knownGestures, gestureStrings } from '../util/gestures.js'

export default class handGestureService {
    #gestureEstimator
    #handPoseDetection
    #handsVersion
    #detector = null

    constructor({ fingerpose, handPoseDetection, handsVersion }) {
        this.#gestureEstimator = new fingerpose.GestureEstimator(knownGestures)
        this.#handPoseDetection = handPoseDetection
        this.#handsVersion = handsVersion
    } 

    async estimate(keypoints3D){
        const predictions = await this.#gestureEstimator.estimate(
            this.#getLandMarksFromKeypoints(keypoints3D),
            // gesture confidence percentage (90%)
            9
        )
        return predictions.gestures
    }

    async * detectGestures(predictions) {
        for (const hand of predictions) {
            if (!hand.keypoints3D) continue

            const gestures = await this.estimate(hand.keypoints3D)
            if(!gestures.length) continue;
            
            const result = gestures.reduce(
                (previous, current) => (previous.score > current.score) ? previous : current
            )

            const {x,y} = hand.keypoints.find(keypoint => keypoint.name === 'index_finger_tip')
            // Using this when receive the result will send and continue the loop
            yield { event: result.name, x, y }

            console.log('Gesture detected', gestureStrings[result.name])
        }
    }

    #getLandMarksFromKeypoints(keypoints3D) {
        return keypoints3D.map(keypoint =>
          [keypoint.x, keypoint.y, keypoint.z]
        )
    }

    async estimateHands(video) {
        return this.#detector.estimateHands(video, {
            flipHorizontal: true,
        })
    }

    async initializeDetector() {
        if(this.#detector) return this.#detector

        const detectorConfig = {
            runtime: 'mediapipe', // or 'tfjs',
            solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${this.#handsVersion}`,
            modelType: 'lite', // not necessary 'full', using lite to reduce data
            maxHands: 2
        }
        this.#detector = await this.#handPoseDetection.createDetector(
            this.#handPoseDetection.SupportedModels.MediaPipeHands,
            detectorConfig
        )

        return this.#detector
    }
}