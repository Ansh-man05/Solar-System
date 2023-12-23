import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const OBJECTS = {
  SUN: 'sun',
  MERCURY: 'mercury',
  VENUS: 'venus',
  EARTH: 'earth',
  MOON: 'moon',
  MARS: 'mars',
  JUPITER: 'jupiter',
  SATURN: 'saturn',
  SATURN_RINGS: 'saturn_rings',
  URANUS: 'uranus',
  NEPTUNE: 'neptune'
};
const distancesFromSun = {
    MERCURY: 57.9,
    VENUS: 108.2,
    EARTH: 149.6,
    MARS: 227.9,
    JUPITER: 778.6,
    SATURN: 1429.4,
    URANUS: 2870.7,
    NEPTUNE: 4498.4,
  };

class ObjectGroup {
    constructor(index, title, radius, extra, distanceFromSun) {
      const objectGroup = new THREE.Group();

      if (extra) {
          switch (title) {
              case OBJECTS.EARTH:
                  extra.position.x += distanceFromSun/15  + 5.5;

                  break;
              case OBJECTS.SATURN:
                  extra.position.x += distanceFromSun/7;
                  extra.rotation.x = 2;

                  break;
          }

          objectGroup.add(extra);
      }

      const planet = ObjectGroup.createObject(title, new THREE.SphereGeometry(radius, 64, 32));
      planet.position.x = distanceFromSun/7;
      objectGroup.add(planet);

      
  

      return objectGroup;
  }

  static createObject = (title, objectGeometry) => {
      const objectTexture = new THREE.TextureLoader().load(`textures/${title}.jpg`);
      const objectMaterial = new THREE.MeshPhongMaterial({ map: objectTexture });
      const objectMesh = new THREE.Mesh(objectGeometry, objectMaterial);

      return objectMesh;
  };
}

const planets = [
    { title: OBJECTS.MERCURY, radius: 0.383, distanceFromSun: 57.9 },
    { title: OBJECTS.VENUS, radius: 0.958, distanceFromSun: 108.2 },
    // Include distanceFromSun property for each planet in a similar manner
    {
      title: OBJECTS.EARTH,
      radius: 1,
      distanceFromSun: 149.6,
    },
    { title: OBJECTS.MARS, radius: 0.442, distanceFromSun: 227.9 },
    { title: OBJECTS.JUPITER, radius: 10.484, distanceFromSun: 778.6 },
    {
      title: OBJECTS.SATURN,
      radius: 8.567,
      distanceFromSun: 1429.4,
      extra: ObjectGroup.createObject(OBJECTS.SATURN_RINGS, new THREE.TorusGeometry(10, 1, 2, 32)),
    },
    { title: OBJECTS.URANUS, radius: 3.725, distanceFromSun: 2870.7 },
    { title: OBJECTS.NEPTUNE, radius: 3.470, distanceFromSun: 4498.4 },
  ];
  

// Setup


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);





// Helpers

//const lightHelper = new THREE.PointLightHelper(directionalLight)
 const gridHelper = new THREE.GridHelper(200, 50);
 //scene.add( gridHelper)

const controls = new OrbitControls(camera, renderer.domElement);

// Background

const spaceTexture = new THREE.TextureLoader().load('black1.jpg');
scene.background = spaceTexture;

// New code for creating a realistic sun with lighting
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('/sun.jpg'); // Replace with your sun texture path


// Create a sphere geometry and apply the texture to it
const sunGeometry = new THREE.SphereGeometry(12, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture,
  side: THREE.DoubleSide,
  emissive: 0xffffff, // Add emissive property for self-illumination
  emissiveIntensity: 1, // Emissiveness strength
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Create a light source (point light) at the center of the sun
const light = new THREE.PointLight(0xffffff, 10000, 1000000000000000000000);
light.position.set(0, 0, 0);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040,0.8); // Soft white ambient light
scene.add(ambientLight);

// You might also want to add a glow effect around the sun
const glowMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture, // Use the same sun texture for the glow effect
  transparent: true,
  opacity: 0.5,
  side: THREE.BackSide, // Render the material on the back side of the geometry
});
const sunGlow = new THREE.Mesh(sunGeometry.clone(), glowMaterial);
sunGlow.scale.multiplyScalar(1.001); // Adjust the scale for the glow
scene.add(sunGlow);

const planetsMap = new Map();
for (let [index, { title, radius, extra, distanceFromSun }] of planets.entries()) {
    const planetGroup = new ObjectGroup(index + 1, title, radius, extra, distanceFromSun);
    planetsMap.set(title, planetGroup);
    scene.add(planetGroup);; // Add planets to the sunMesh
}
function createOrbit(distanceFromSun) {
    const orbitRadius = distanceFromSun / 7;
    const orbitTubeRadius = 0.001; // Adjust the tube radius as needed
    const orbitRadialSegments = 256; // Adjust segments as needed
  
    const orbitGeometry = new THREE.TorusGeometry(orbitRadius, orbitTubeRadius, orbitRadialSegments, 128);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const orbitPath = new THREE.Line(orbitGeometry, orbitMaterial);
    orbitPath.rotation.x = Math.PI / 2;
  
    return orbitPath;
  }
  
  // Loop through the planets array to create planets, orbits, and add them to the scene
  for (let i = 0; i < 8; i++) {
    const planetData = planets[i];
    const distance = planetData.distanceFromSun;
  
    const orbitPath = createOrbit(distance);
  
    // Add orbit path to the scene
    scene.add(orbitPath);
  }
  



const EARTH_YEAR = (2 * Math.PI) / 365;

const earthGroup = planetsMap.get(OBJECTS.EARTH);
const moonOrbitCenter = new THREE.Group();
earthGroup.add(moonOrbitCenter); // Add moon's orbit center as a child of the Earth

const orbitRadius = 28; // Set the radius of the moon's orbit around the Earth
const orbitSpeed = 0.01; // Adjust the speed of the orbit as needed

// Create the moon object with textures
const moonTexture = new THREE.TextureLoader().load('moon.jpg');
const normalTexture = new THREE.TextureLoader().load('normal.jpg');

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(1.5, 32, 32), // Adjust the moon's size if needed
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
  })
);

moonOrbitCenter.add(moon); // Add the moon as a child of the moon's orbit center
// Set the initial position of the moon relative to its orbit around the Earth
moon.position.x = orbitRadius; // Set the moon's initial position along the orbit
moon.position.z = 0; // Adjust this if the moon should not be exactly on the x-axis
// You can also set the moon's initial inclination or y-position as needed
// Animation Loop

function animate() {
    requestAnimationFrame(animate);
  
    sun.rotation.y += 0.001;

    planetsMap.get(OBJECTS.MERCURY).rotation.y += EARTH_YEAR * 4;
    planetsMap.get(OBJECTS.VENUS).rotation.y += EARTH_YEAR * 2;
    planetsMap.get(OBJECTS.EARTH).rotation.y += EARTH_YEAR;
    planetsMap.get(OBJECTS.MARS).rotation.y += EARTH_YEAR / 2;
    planetsMap.get(OBJECTS.JUPITER).rotation.y += EARTH_YEAR / 4;
    planetsMap.get(OBJECTS.SATURN).rotation.y += EARTH_YEAR / 8;
    planetsMap.get(OBJECTS.URANUS).rotation.y += EARTH_YEAR / 16;
    planetsMap.get(OBJECTS.NEPTUNE).rotation.y += EARTH_YEAR / 32;
 

    
    for (let planetGroup of planetsMap.values()) {
        planetGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.needsUpdate = true; // Update material to reflect changes
          }
        });
      }
      
      moonOrbitCenter.rotation.y += orbitSpeed;  
    controls.update(); // Add this line to update the controls
  
    renderer.render(scene, camera);
  }
  
  animate();
  
