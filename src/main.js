import * as THREE from 'three'
import OrbitControls from './libs/OrbitControls'
import sampleObj from './assets/kitten_noisy.obj'
import {loadOuterObject} from "./loaders";
import doSubdivision from './triangleSubdivision'
import {ObjectAffine} from "./objectAffine";

let canvasDom = document.getElementById('canvas')


// render
let renderer = new THREE.WebGLRenderer({
    canvas: canvasDom
})
renderer.setSize(700, 700)


// scene
let scene = new THREE.Scene()

// camera
let camera = new THREE.OrthographicCamera(-50, 50, 50, -50, 1, 1000)
camera.position.set(0, 0, 50)
camera.lookAt(new THREE.Vector3(0, 0, 0))


// helpers
scene.add(new THREE.AxesHelper(50))
// let control = new OrbitControls(camera)


// light
let ambientLight = new THREE.AmbientLight(0xa0a0a0); // soft white light
scene.add(ambientLight);
let directionLight = new THREE.DirectionalLight(0xbbbbbb)
directionLight.position.set(1, 1, 1)
scene.add(directionLight)


let convertResult = result => ({
    vertices: result.vertices.map(v => new THREE.Vector3(v[0], v[1], v[2])),
    faces: result.faces.map(v => new THREE.Face3(v.indices[0] - 1, v.indices[1] - 1, v.indices[2] - 1))
})

let objectAffine = new ObjectAffine(canvasDom)


// sample
loadOuterObject(sampleObj)
    .then(convertResult)
    .then(data => {

        let props = data

        let getMeshFromProps = props => {

            let geometry = new THREE.Geometry()

            geometry.vertices = props.vertices
            geometry.faces = props.faces
            geometry.computeFaceNormals()
            geometry.computeVertexNormals()

            let material = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(Math.random(), .5, .5),
                // wireframe: true
                flatShading:true
            })
            let mesh = new THREE.Mesh(geometry, material)
            mesh.scale.set(25, 25, 25)
            return mesh
        }


        let meshRaw = getMeshFromProps(props)
        props = doSubdivision(props.vertices, props.faces)
        let meshNew = getMeshFromProps(props)


        meshNew.position.set(20, 0,0)

        scene.add(meshRaw)
        scene.add(meshNew)

        objectAffine.watch(meshNew)
        objectAffine.watch(meshRaw)

    })


// render
render()

function render() {
    renderer.render(scene, camera)
    requestAnimationFrame(render)
}