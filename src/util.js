export function debounce(func, wait=200) {
    let lastTime = 0
    return function (...args) {
        let now = Date.now()
        if (now-lastTime>=wait){
            func.apply(null,args)
            lastTime = now
        }
    }
}