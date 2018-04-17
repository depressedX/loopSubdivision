import * as THREE from 'three'

class Edge {
    constructor(a, b) {
        this.a = a
        this.b = b
        this.offsetVertices = []
    }

    // 带有方向的字符串
    valueOf() {
        return this.a + '->' + this.b
    }

    // 忽略方向的字符串
    uniqueKey() {
        return Math.min(this.a, this.b) + '->' + Math.max(this.a, this.b)
    }

    // 忽略方向
    equals(v) {
        return v instanceof Edge && (this.valueOf() === v.valueOf() || new Edge(this.b, this.a).valueOf() === v.valueOf())
    }
}

export default function doSubdivision(vertices, faces) {

    let verticesNew, facesNew = []


    let relatedVertices = Array.from({length: vertices.length}).map(v => new Set())
    // 计算邻接的顶点
    faces.forEach(face => {
        relatedVertices[face.a].add(face.b).add(face.c)
        relatedVertices[face.b].add(face.a).add(face.c)
        relatedVertices[face.c].add(face.a).add(face.b)
    })

    // 生成新的顶点
    let vVertices = vertices.map((vertex, index) => {
        let k = relatedVertices[index].size,
            beta = k === 3 ? 3 / 16 : 3 / 8 / k
        return new THREE.Vector3(0, 0, 0)
            .addScaledVector(vertex, 1 - k * beta)
            .addScaledVector(Array.from(relatedVertices[index]).map(v => vertices[v]).reduce((p, c) => p.add(c), new THREE.Vector3(0, 0, 0)), beta)

    })

    // 生成新的边点
    let eVertices = {}
    faces.forEach(face => {

        // 半运算
        let calc = (a, b, c) => {
            let edge = new Edge(a, b)
            let key = edge.uniqueKey()
            eVertices[key] = eVertices[key] || new THREE.Vector3(0, 0, 0)
            eVertices[key]
                .addScaledVector(vertices[a], 3 / 16)
                .addScaledVector(vertices[b], 3 / 16)
                .addScaledVector(vertices[c], 1 / 8)
        }

        let {a, b, c} = face

        calc(a, b, c)
        calc(a, c, b)
        calc(b, c, a)
    })


    // 生成边点序号 生成新顶点数组
    verticesNew = vVertices
    let eVertexIndex = {}
    let currentIndex = verticesNew.length
    for (let i in eVertices) {
        let v = eVertices[i]
        eVertexIndex[i] = currentIndex++
        verticesNew.push(v)
    }


    // 拓扑过程
    faces.forEach(face => {

        let {a, b, c} = face

        facesNew.push(new THREE.Face3(a, eVertexIndex[new Edge(a, b).uniqueKey()], eVertexIndex[new Edge(a, c).uniqueKey()]))
        facesNew.push(new THREE.Face3(b, eVertexIndex[new Edge(b, c).uniqueKey()], eVertexIndex[new Edge(b, a).uniqueKey()]))
        facesNew.push(new THREE.Face3(c, eVertexIndex[new Edge(c, a).uniqueKey()], eVertexIndex[new Edge(c, b).uniqueKey()]))
        facesNew.push(new THREE.Face3(
            eVertexIndex[new Edge(a, b).uniqueKey()],
            eVertexIndex[new Edge(b, c).uniqueKey()],
            eVertexIndex[new Edge(c, a).uniqueKey()]))

    })
    return {
        vertices: verticesNew,
        faces: facesNew
    }
}