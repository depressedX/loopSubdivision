import {debounce} from "./util"
import * as THREE from 'three'

function executeConditionally(test) {
    return function (func) {
        return function (...args) {
            if (test(...args)) {
                func.apply(null, args)
            }
        }
    }
}

let executeWhenLeftButton = executeConditionally(e => e.button === 0),
    executeWhenRightButton = executeConditionally(e => e.button === 2)

export class ObjectAffine {
    constructor(dom) {
        this.dom = dom
        this.objects = []
        this.initialScales = []
        this.zoom = 1


        this.rotating = false
        this.rotationPreX = this.rotationPreY = 0
        this.translating = false
        this.translationPreX = this.translationPreY = 0
        this.upVector = new THREE.Vector3(0, 1, 0)
        this.sideVector = new THREE.Vector3(1, 0, 0)

        this.dom.addEventListener('contextmenu', (e) => {
            e.preventDefault()
        })


        this.dom.addEventListener('mousedown',
            executeWhenLeftButton(e => {
                this.rotating = true
                this.rotationPreX = e.offsetX
                this.rotationPreY = e.offsetY
            }))
        document.body.addEventListener('mousemove',
            debounce((e) => {
                if (!this.rotating) return
                let x = e.offsetX,
                    y = e.offsetY
                this.rotateVertically((y - this.rotationPreY) / 200)
                this.rotateHorizontally((x - this.rotationPreX) / 200)
                this.rotationPreY = y
                this.rotationPreX = x
            }, 20),
        )
        document.body.addEventListener('mouseup',
            executeWhenLeftButton(e => {
                this.rotating = false
            }))


        this.dom.addEventListener('mousedown',
            executeWhenRightButton(e => {
                this.translating = true
                this.translationPreX = e.offsetX
                this.translationPreY = e.offsetY
            }))
        document.body.addEventListener('mousemove',
            debounce((e) => {
                if (!this.translating) return
                let x = e.offsetX,
                    y = e.offsetY
                this.translateUp(-(y - this.translationPreY) / 10)
                this.translateRight((x - this.translationPreX) / 10)
                this.translationPreY = y
                this.translationPreX = x
            }, 20),
        )
        document.body.addEventListener('mouseup',
            executeWhenRightButton(e => {
                this.translating = false
            }))


        this.dom.addEventListener('wheel', e => {
            console.log(e.deltaZ, e.deltaY)
            this.scale(this.zoom * (e.deltaY > 0 ? .9 : 1.1))
        })
    }

    watch(object) {
        this.objects.push(object)
        this.initialScales.push(object.scale.clone())
    }

    rotateVertically(angle) {
        // 更新向上向量
        this.upVector.applyAxisAngle(this.sideVector, -angle)
        if (this.upVector.y < 0) {
            this.upVector.applyAxisAngle(this.sideVector, angle)
            return
        }
        this.objects.forEach(object => {
            object.rotateOnAxis(this.sideVector, angle)
        })
    }

    rotateHorizontally(angle) {
        // 更新向上向量
        this.upVector.applyAxisAngle(this.upVector, -angle)
        this.objects.forEach(object => {
            object.rotateOnAxis(this.upVector, angle)
        })
    }

    translateUp(x) {
        this.objects.forEach(object => {
            object.translateOnAxis(this.upVector, x)
        })
    }

    translateRight(x) {
        this.objects.forEach(object => {
            object.translateOnAxis(this.sideVector, x)
        })

    }

    scale(x) {
        this.zoom = x
        this.objects.forEach((object, index) => {
            let iScale = this.initialScales[index]
            object.scale.set(iScale.x * x, iScale.y * x, iScale.z * x,)
        })
    }
}