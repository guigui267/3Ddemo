import { TDScene } from './Viewer'
import * as THREE from 'three'

let newScene = new TDScene()

newScene.AxesHelper()
newScene.ambientLight.intensity = 0.5
// newScene.scene.background = newScene.setColor('#fff')
newScene.camera.position.set(100, 100, 100)

let light1 = newScene.SpotLight('#fff', 1)
light1.position.set(0, 100, 0)
newScene.scene.add(light1)

newScene.LoadGltf('http://1.117.26.233:8888/testMode/jjcz-optimized.gltf', object => {
  // console.log(object)
  object.traverse(child => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: '#008040',
        side: THREE.DoubleSide
      })
      newScene.addChooseObj(child)
    }
  })

  newScene.scene.add(object)
})

// let div1 = document.createElement('div')
// div1.style.width = '20px'
// div1.style.height = '8px'
// div1.style.background = 'red'
// console.log(div1, 'div面板')
let div1=document.querySelector('iframe')

let bbd = newScene.TBillboard(div1)
bbd.position.y = 20
bbd.scale.set(0.1,0.1,0.1)
newScene.scene.add(bbd)

newScene.scene.background = newScene.SceneBGimg('./resources/skyCube/')

window.addEventListener('message', e => {
  if (e.data.id) {
    newScene.FocusObject(e.data.id)
   

    if (e.data.add) {
      for (let mo of newScene.chooseGroup) {
        if (mo.id == e.data.id) {
          let bbs = newScene.TBillboard(div1)
          bbs.position.set(mo.position.x, mo.position.y, mo.position.z)
          newScene.add(bbs)
        }
      }
    }
  }
})

window.addEventListener('mousemove', event => {
  // newScene.ToScreen2D(event)
})
