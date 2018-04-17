import OBJLoader from './libs/OBJLoader'
import OBJLoader2 from 'obj-mtl-loader'


// instantiate a loader
let loader = new OBJLoader2()

export function loadOuterObject(url) {
    return new Promise((resolve, reject) => {
        loader.load(
            url,
            function (err, result) {
                if (err){
                    reject(err)
                }else {
                    resolve(result)
                }
            }
        );
    })
}