'use strict';

let camera, renderer, scene, mat, _primitive;
const uniforms = {
  time: {
    type: 'f',
    value: 1.0,
  },
  pointscale: {
    type: 'f',
    value: 1.0,
  },
  decay: {
    type: 'f',
    value: 2.0,
  },
  complex: {
    type: 'f',
    value: 2.0,
  },
  waves: {
    type: 'f',
    value: 3.0,
  },
  eqcolor: {
    type: 'f',
    value: 3.0,
  },
  fragment: {
    type: 'i',
    value: false,
  },
  dnoise: {
    type: 'f',
    value: 0.0,
  },
  qnoise: {
    type: 'f',
    value: 4.0,
  },
  r_color: {
    type: 'f',
    value: 0.0,
  },
  g_color: {
    type: 'f',
    value: 0.0,
  },
  b_color: {
    type: 'f',
    value: 0.0,
  },
};
const options = {
  perlin: {
    vel: 0.002,
    speed: 0.0002,
    perlins: 1.0,
    decay: 0.40,
    complex: 0.0,
    waves: 10.0,
    eqcolor: 7.0,
    fragment: false,
    redhell: true,
  },
  rgb: {
    r_color: 6.0,
    g_color: 0.0,
    b_color: 0.2,
  },
  cam: {
    zoom: 6,
  },
};
const start = Date.now();

const onWindowResize = () => {
  const _width = window.innerWidth;
  const _height = window.innerHeight > _width
    ? _width + 50 : window.innerHeight;
  renderer.setSize(_width, _height);
  camera.aspect = _width / _height;
  camera.updateProjectionMatrix();
};

const createWorld = () => {
  const _width = window.innerWidth;
  const _height = window.innerHeight > _width
    ? _width + 50 : window.innerHeight;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 5, 15);
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(35, _width / _height, 1, 1000);
  camera.position.set(0, 0, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(_width, _height);
  renderer.shadowMap.enabled = true;
  renderer.domElement.classList.add('canvas');
  document.body.appendChild(renderer.domElement);

  setTimeout(() => {
    renderer.domElement.style.opacity = '.7';
  }, _width < 1025 ? 1200 : 3300);

  window.addEventListener('resize', onWindowResize, false);
};

const createLights = () => {
  const _ambientLights = new THREE.HemisphereLight(0xFFFFFF, 0x000000, 1.4);
  const _lights = new THREE.PointLight(0xFFFFFF, .5);
  _lights.position.set(20, 20, 20);
  scene.add(_ambientLights);
};

const primitiveElement = function () {
  this.mesh = new THREE.Object3D();
  const geo = new THREE.IcosahedronGeometry(1, 6);
  mat = new THREE.ShaderMaterial({
    wireframe: false,
    uniforms: uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
  });
  const _mesh = new THREE.Mesh(geo, mat);
  this.mesh.add(_mesh);
};

const createPrimitive = () => {
  _primitive = new primitiveElement();
  _primitive.mesh.scale.set(1, 1, 1);
  scene.add(_primitive.mesh);
};

const animation = () => {
  requestAnimationFrame(animation);

  TweenMax.to(camera.position, 1, { z: options.cam.zoom + 5 });

  _primitive.mesh.rotation.y += 0.001;
  mat.uniforms['time'].value = options.perlin.speed * (Date.now() - start);
  mat.uniforms['pointscale'].value = options.perlin.perlins;
  mat.uniforms['decay'].value = options.perlin.decay;
  mat.uniforms['complex'].value = options.perlin.complex;
  mat.uniforms['waves'].value = options.perlin.waves;
  mat.uniforms['eqcolor'].value = options.perlin.eqcolor;
  mat.uniforms['r_color'].value = options.rgb.r_color;
  mat.uniforms['g_color'].value = options.rgb.g_color;
  mat.uniforms['b_color'].value = options.rgb.b_color;
  mat.uniforms['fragment'].value = options.perlin.fragment;

  renderer.render(scene, camera);
};

const changeColorMouseMove = (e) => {
  const doc = document.documentElement;

  options.rgb = {
    r_color: 6,
    g_color: Math.abs(((e.clientX * 4) / doc.offsetWidth) - 3.8),
    b_color: Math.abs(((e.clientY * 4) / doc.offsetHeight) - 0.2),
  };
};

const changeColorScroll = () => {
  const textElem = document.getElementById('mainText');
  const scroll = textElem.scrollTop * 6 /
    (textElem.scrollHeight - textElem.clientHeight);

  options.rgb = {
    r_color: Math.abs(scroll - 6),
    g_color: scroll,
    b_color: 0.2,
  };
};

const handleResize = () => {
  const _width = window.innerWidth;
  const doc = document.documentElement;
  const textElem = document.getElementById('mainText');
  if (_width >= 1025) {
    doc.addEventListener('mousemove', changeColorMouseMove, false);
    textElem.removeEventListener('scroll', changeColorScroll, false);
  }
  if (_width < 1025) {
    doc.removeEventListener('mousemove', changeColorMouseMove, false);
    textElem.addEventListener('scroll', changeColorScroll, false);
  }
};

const getNumbers = () => {
  const width = window.innerWidth;
  let numLoad, numMenu;

  if (width >= 1025) {
    numLoad = [0, 1, 11, 3, 5, 6, 7, 8, 9, 10, 12];
    numMenu = [];
  }

  if (width < 1025) {
    numLoad = [0, 1, 2, 12];
    numMenu = [3, 4, 5, 6, 7, 8, 9, 10, 11];
  }

  return { numLoad, numMenu };
};

const getDelay = (numbers, spawnRate) => {
  const delay = [];

  if (numbers.length !== 0)
    for (let i = 0; i < numbers.length; i++)
      delay[i] = (i !== (numbers.length - 1)) ?
        (spawnRate * (i + 1)) : (spawnRate * (i + 2));

  return delay;
};

const setOpacity = (elems, numbers, delay) => {
  for (let i = 0; i < numbers.length; i++)
    setTimeout(() => {
      if (numbers[i] !== 13)
        elems[numbers[i]].style.opacity =
          Math.abs(elems[numbers[i]].style.opacity - 1);
      if (numbers[i] === 1) elems[1].classList.add('down');
    }, delay[i]);
};

const menuToggle = () => {
  const elems = document.getElementsByClassName('delay');
  const hamburger = document.getElementById('hamburger').classList;
  const { numMenu } = getNumbers();

  let delay;
  if (hamburger.contains('active')) delay = getDelay(numMenu, 0);
  if (!hamburger.contains('active')) delay = getDelay(numMenu, 200);

  hamburger.toggle('active');
  document.getElementById('navbar').classList.toggle('sidebar-open');
  setOpacity(elems, numMenu, delay);
};

const init = () => {
  const elems = document.getElementsByClassName('delay');
  const { numLoad } = getNumbers();
  const delay = getDelay(numLoad, 300);
  setOpacity(elems, numLoad, delay);

  createWorld();
  createLights();
  createPrimitive();
  animation();
  handleResize();
};

window.addEventListener('load', init, false);
window.addEventListener('resize', handleResize, false);
document.getElementById('hamburger').
  addEventListener('click', menuToggle, false);
