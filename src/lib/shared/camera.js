export default class Camera {
    constructor() {
        this.video = document.createElement('video');
    }
    static async init() {
        if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
            throw new Error(
                `Browser API navigator.mediaDevices.getUserMedia not available`
            )
        }

        const videoConfig = {
            audio: false,
            video: {
                facingMode: "user",
                width: globalThis.screen.availWidth,
                height: globalThis.screen.availHeight,
                frameRate: { 
                    ideal: 60 
                }
            }
        }

        const stream = await navigator.mediaDevices.getUserMedia(videoConfig)
        const camera = new Camera()
        camera.video.srcObject = stream

        // debug reasons!
/*         camera.video.width = 320
        camera.video.height = 240
        document.body.append(camera.video) */

        // wait for the camera start!
        await new Promise(resolve => {
            camera.video.onloadedmetadata = () => {
                resolve(camera.video)
            }
        })
        .then(video => video.play())

        return camera
    }
}