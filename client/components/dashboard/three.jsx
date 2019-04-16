import React, { Component } from 'react';
import * as THREE from 'three';
import { Widget } from "./widget.jsx"
export class ThreeDWidget extends Component {
    autofit;

    componentDidMount() {


        this.autofit = setInterval(() => {
            this.fitToDiv();
        }, 100)

        const width = this.mount.offsetWidth
        const height = this.mount.offsetHeight
        console.log({ width, height })
        //ADD SCENE
        this.scene = new THREE.Scene()
        //ADD CAMERA
        this.camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        )
        this.camera.position.z = 4
        //ADD RENDERER
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setClearColor('#000000')

        //this.renderer.setSize(width, height)
        this.fitToDiv();

        this.mount.appendChild(this.renderer.domElement)
        //ADD CUBE
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshBasicMaterial({ color: '#433F81' })
        this.cube = new THREE.Mesh(geometry, material)
        this.scene.add(this.cube)
        this.start()
    }

    fitToDiv() {
        var detectedSize = { width: this.mount.offsetWidth, height: this.mount.offsetHeight }

        if (this.camera) {
            this.camera.aspect = detectedSize.width / detectedSize.height
            this.camera.updateProjectionMatrix();
        }

        this.renderer.setSize(detectedSize.width, detectedSize.height)
    }

    componentWillUnmount() {
        this.stop()
        this.mount.removeChild(this.renderer.domElement)
        clearInterval(this.autofit);
    }

    start = () => {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    }
    stop = () => {
        cancelAnimationFrame(this.frameId)
    }
    animate = () => {
        this.cube.rotation.x += 0.01
        this.cube.rotation.y += 0.01
        this.renderScene()
        this.frameId = window.requestAnimationFrame(this.animate)
    }
    renderScene = () => {
        this.renderer.render(this.scene, this.camera)
    }
    render() {
        return (
            <Widget label={this.props.data.dataname} options={this.options} dash={this.props.dash}>
                <div
                    style={{
                        width: "100%", height: '100%',
                        //background: "#ff0"
                    }}
                    ref={(mount) => { this.mount = mount }}
                />
            </Widget>


        )
    }
}
