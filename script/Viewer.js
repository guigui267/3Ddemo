import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'
import {
  CSS3DObject,
  CSS3DSprite,
  CSS3DRenderer
} from 'three/examples/jsm/renderers/CSS3DRenderer'

export class TDScene {
  constructor (id) {
    this.getDivId(id)
    this.initScene()
    this.initRender()
    this.initCSS3DRender()
    this.initCamera()
    this.initControls()
    this.initAmbLight()
    this.initRaycaster()
    this.initMouse()
    this.EventListen()
    this.Update()
  }

  //获取Div id
  getDivId (id) {
    let contain
    if (id) {
      contain = document.getElementById(id)
    } else {
      contain = document.body
    }
    return (this.contain = contain)
  }

  //初始化场景
  initScene () {
    let scene = new THREE.Scene()
    return (this.scene = scene)
  }

  //初始化渲染器
  initRender () {
    let renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    this.contain.appendChild(renderer.domElement)

    return (this.renderer = renderer)
  }

  //初始化CSS3D渲染器
  initCSS3DRender () {
    let renderer2 = new CSS3DRenderer()
    renderer2.setSize(window.innerWidth, window.innerHeight)
    renderer2.domElement.style.position = 'absolute'
    renderer2.domElement.style.top = 0
    // renderer2.setPixelRatio(window.devicePixelRatio)
    this.contain.appendChild(renderer2.domElement)
    return (this.CSS3Drenderer = renderer2)
  }

  //初始化相机
  initCamera () {
    let camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(10, 10, 10)
    camera.lookAt(0, 0, 0)
    this.scene.add(camera)
    return (this.camera = camera)
  }

  //初始化轨道控制器
  initControls () {
    let controls = new OrbitControls(this.camera, this.CSS3Drenderer.domElement)
    controls.enableDamping = true
    return (this.controls = controls)
  }

  //初始化场景全局光
  initAmbLight () {
    let ambi = new THREE.AmbientLight('#fff', 1)
    this.scene.add(ambi)
    return (this.ambientLight = ambi)
  }

  //窗口自适应大小
  WindowResize () {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.CSS3Drenderer.setSize(window.innerWidth,window.innerHeight)
  }

  //windows事件监听
  EventListen () {
    window.addEventListener('resize', this.WindowResize.bind(this))
    window.addEventListener('mousemove', this.mouseMove.bind(this))
    window.addEventListener('dblclick', this.doubleClickMouse.bind(this))
  }

  //场景辅助线
  AxesHelper (length = 50) {
    let axes = new THREE.AxesHelper(length)
    this.scene.add(axes)
    return axes
  }

  //场景更新
  Update () {
    requestAnimationFrame(this.Update.bind(this))
    TWEEN.update()
    // this.renderer.clear()
    // this.CSS3Drenderer.clear()
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.CSS3Drenderer.render(this.scene, this.camera)
    if (this.raycaster) {
      this.raycaster.setFromCamera(this.mouse, this.camera) //射线必须要更新
    }
  }

  //加载模型
  LoadGltf (url, func) {
    let loader = new GLTFLoader()
    loader.load(url, object => {
      func(object.scene)
    })
  }
  // 设置颜色
  setColor (data) {
    return new THREE.Color(data)
  }
  //创建聚光灯
  SpotLight (color = '#fff', intensity = 1) {
    let light = new THREE.SpotLight(color, intensity)
    return light
  }

  //initRaycaster
  initRaycaster () {
    let raycaster = new THREE.Raycaster()
    return (this.raycaster = raycaster)
  }

  //initMouse
  initMouse () {
    let mouse = new THREE.Vector2()
    return (this.mouse = mouse)
  }

  chooseGroup = [] //可以被选中的对象
  addChooseObj (mesh) {
    this.chooseGroup.push(mesh)
  }

  //鼠标移动事件
  mouseMove (event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  }

  lastChooseObject = []
  //鼠标双击事件
  doubleClickMouse (event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    const interscets = this.raycaster.intersectObjects(this.chooseGroup)
    if (interscets.length > 0) {
      let chooseModel = interscets[0].object
      this.lastChooseObject.push(chooseModel)
      this.ClickColorChange(chooseModel) //物体变色
      console.log(chooseModel, '被选中的对象')
      this.CameraTarget(chooseModel)
    } else {
      this.lastChooseObject.push(new THREE.Mesh())
      this.ClickColorChange()
    }
  }

  //选中物体变色
  ClickColorChange (object) {
    let length = this.lastChooseObject.length
    if (this.lastChooseObject.length > 1) {
      // console.log(this.lastChooseObject[length - 1], '获取上个对象')
      this.lastChooseObject[length - 2].material.emissive = this.setColor(
        'green'
      )
      this.lastChooseObject[length - 2].material.emissiveIntensity = 0
    }
    if (object) {
      object.material.emissive = this.setColor('red')
      object.material.emissiveIntensity = 1
    }
  }

  //相机朝向
  CameraTarget (object) {
    let from = { x: 0, y: 0, z: 0, a: 0, b: 0, c: 0 }
    // console.log(this.camera)
    from.x = this.camera.position.x
    from.y = this.camera.position.y
    from.z = this.camera.position.z
    from.a = this.controls.target.x
    from.b = this.controls.target.y
    from.c = this.controls.target.z

    // console.log(from, 'frm')

    let tos = { x: 0, y: 0, z: 0 }
    tos.x = object.position.x
    tos.y = object.position.y
    tos.z = object.position.z
    // console.log(tos, 'ddee')
    let tweenAnimate = new TWEEN.Tween(from)
    tweenAnimate.to(
      {
        x: tos.x + 50,
        y: tos.y + 50,
        z: tos.z + 50,
        a: tos.x,
        b: tos.y,
        c: tos.z
      },
      1000
    )
    tweenAnimate.onUpdate(() => {
      // console.log(from.x, 'ssss')
      this.camera.position.set(from.x, from.y, from.z)
      this.controls.target = new THREE.Vector3(from.a, from.b, from.c)
      this.camera.lookAt(new THREE.Vector3(from.a, from.b, from.c))
    })

    tweenAnimate.start()
  }

  //Focus object (根据id来)
  FocusObject (id) {
    if (id) {
      for (let m of this.chooseGroup) {
        if (m.id == id) {
          // this.CameraTarget(m)
          console.log(m, 'id对应的对象')
          this.lastChooseObject.push(m)
          this.ClickColorChange(m)
          this.ToScreen2D(m.position.x,m.position.y,m.position.z)
        }
      }
    }
  }

  //标签板
  TBillboard (div) {
    if (div) {
      let bbd = new CSS3DSprite(div)
      return bbd
    }
  }

  //场景背景
  SceneBGimg (path) {
    if (path) {
      let bgloader = new THREE.CubeTextureLoader()
        .setPath(path)
        .load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'])
      return bgloader
    }
  }


  //转化屏幕2D坐标
  ToScreen2D (x, y, z) {
    // const x = event.clientX //鼠标单击坐标X
    // const y = event.clientY //鼠标单击坐标Y
    // const x1 = (x / window.innerWidth) * 2 - 1
    // const y1 = -(y / window.innerHeight) * 2 + 1
    const stdVector = new THREE.Vector3(x, y, z)
    const worldVector = stdVector.unproject(this.camera)

    const stand = worldVector.project(this.camera)
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const screenX = Math.round(centerX * stand.x + centerX)
    const screenY = Math.round(-centerY * stand.y + centerY)

    console.log(screenX, screenY,"2D屏幕坐标")
  }
}
