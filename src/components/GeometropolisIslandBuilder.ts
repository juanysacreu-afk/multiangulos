import * as THREE from 'three';

export interface GeometropolisAnimState {
  ferrisWheel?: THREE.Group;
  ferrisGondolas: THREE.Group[];
  coasterCart?: THREE.Group;
  coasterAngle: number;
  trainGroup?: THREE.Group;
  trainProgress: number;
  lighthouseBeams?: THREE.Group;
  diamondMesh?: THREE.Mesh;
  floatingClouds: THREE.Group[];
  constructionMarkers: THREE.Object3D[];
  balloonGroup?: THREE.Group;
  time: number;
}

function createPlotHologram(
  monumentId: string,
  pos: [number, number, number],
  width: number,
  height: number,
  depth: number,
  interactiveMeshes: THREE.Object3D[],
  constructionMarkers: THREE.Object3D[]
): THREE.Group {
  const plotGroup = new THREE.Group();
  plotGroup.position.set(pos[0], pos[1], pos[2]);
  plotGroup.userData = { monumentId, isBuilt: false };

  // Ground Plot Ring
  const ringGeo = new THREE.RingGeometry(1.2, 2.0, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  plotGroup.add(ring);

  // Hologram wireframe volume
  const wireGeo = new THREE.BoxGeometry(width, height, depth);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  });
  const wireBox = new THREE.Mesh(wireGeo, wireMat);
  wireBox.position.y = height / 2;
  plotGroup.add(wireBox);

  // Floating Construction Marker Diamond
  const markerGeo = new THREE.OctahedronGeometry(0.7, 0);
  const markerMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.6,
    roughness: 0.2,
  });
  const marker = new THREE.Mesh(markerGeo, markerMat);
  marker.position.y = height + 1.2;
  plotGroup.add(marker);
  constructionMarkers.push(marker);

  // Hit box for interaction
  const hitGeo = new THREE.BoxGeometry(Math.max(width, 3), height + 2, Math.max(depth, 3));
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitBox = new THREE.Mesh(hitGeo, hitMat);
  hitBox.position.y = (height + 2) / 2;
  hitBox.userData = { monumentId, isBuilt: false };
  plotGroup.add(hitBox);

  interactiveMeshes.push(hitBox);
  return plotGroup;
}

export function buildGeometropolisScene(
  interactiveMeshes: THREE.Object3D[],
  unlockedBuildingIds: string[] = ['torre-cuadrada']
): {
  group: THREE.Group;
  animState: GeometropolisAnimState;
} {
  const root = new THREE.Group();
  const isBuilt = (id: string) => unlockedBuildingIds.includes(id);

  const animState: GeometropolisAnimState = {
    ferrisGondolas: [],
    coasterAngle: 0,
    trainProgress: 0,
    floatingClouds: [],
    constructionMarkers: [],
    time: 0,
  };

  // -------------------------------------------------------------
  // 1. FLOATING ISLAND TERRAIN & ROCKY CRUST
  // -------------------------------------------------------------
  const islandGroup = new THREE.Group();

  // Top Lush Surface
  const topPlateGeo = new THREE.CylinderGeometry(20, 21, 2.5, 32);
  const topPlateMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e, // Vibrant Emerald Grass
    roughness: 0.6,
    metalness: 0.1,
  });
  const topPlate = new THREE.Mesh(topPlateGeo, topPlateMat);
  topPlate.position.y = 0;
  topPlate.receiveShadow = true;
  islandGroup.add(topPlate);

  // Sandy / Stone Rim
  const rimGeo = new THREE.TorusGeometry(20.3, 0.5, 12, 32);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a, // Golden sand border
    roughness: 0.8,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 1.25;
  islandGroup.add(rim);

  // Under-Island Rocky Cone with faceted look
  const underRockGeo = new THREE.ConeGeometry(20.5, 18, 16);
  const underRockMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Dark slate rock
    roughness: 0.9,
    flatShading: true,
  });
  const underRock = new THREE.Mesh(underRockGeo, underRockMat);
  underRock.rotation.x = Math.PI;
  underRock.position.y = -8;
  islandGroup.add(underRock);

  // Dangling magic power crystal at bottom tip
  const crystalGeo = new THREE.OctahedronGeometry(2.5, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.9,
  });
  const bottomCrystal = new THREE.Mesh(crystalGeo, crystalMat);
  bottomCrystal.position.y = -19;
  islandGroup.add(bottomCrystal);

  // -------------------------------------------------------------
  // 2. CENTRAL CANAL / RIVER & STONE BRIDGE (CONNECTING BOTH SIDES)
  // -------------------------------------------------------------
  const riverGeo = new THREE.PlaneGeometry(3.5, 38, 1, 1);
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x0369a1,
    emissiveIntensity: 0.3,
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.85,
  });
  const river = new THREE.Mesh(riverGeo, riverMat);
  river.rotation.x = -Math.PI / 2;
  river.position.set(0, 1.28, 0);
  islandGroup.add(river);

  // Stone Bridge connecting City and ÁnguloPark
  const bridgeGroup = new THREE.Group();
  bridgeGroup.position.set(0, 1.3, 0);
  const bridgeArchGeo = new THREE.BoxGeometry(6, 0.4, 4);
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
  const bridgeDeck = new THREE.Mesh(bridgeArchGeo, bridgeMat);
  bridgeDeck.position.y = 0.2;
  bridgeGroup.add(bridgeDeck);

  const railGeo = new THREE.BoxGeometry(6, 0.5, 0.3);
  const railMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
  const rail1 = new THREE.Mesh(railGeo, railMat);
  rail1.position.set(0, 0.6, 1.8);
  const rail2 = rail1.clone();
  rail2.position.set(0, 0.6, -1.8);
  bridgeGroup.add(rail1, rail2);
  islandGroup.add(bridgeGroup);

  // -------------------------------------------------------------
  // 3. DISTRICT 1: GEOMETRÓPOLIS (THE GEOMETRIC CITY - WEST SIDE)
  // -------------------------------------------------------------
  const cityPavementGeo = new THREE.CircleGeometry(16, 24, Math.PI / 2, Math.PI);
  const cityPavementMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // Slate city streets
    roughness: 0.8,
  });
  const cityPavement = new THREE.Mesh(cityPavementGeo, cityPavementMat);
  cityPavement.rotation.x = -Math.PI / 2;
  cityPavement.position.set(-0.2, 1.26, 0);
  islandGroup.add(cityPavement);

  // MONUMENT 1: RASCACIELOS CUADRADO (Torre Cúbica con 90°)
  if (isBuilt('torre-cuadrada')) {
    const torreCuadradaGroup = new THREE.Group();
    torreCuadradaGroup.position.set(-8, 1.25, -6);
    torreCuadradaGroup.userData = { monumentId: 'torre-cuadrada', isBuilt: true };

    const squareBodyGeo = new THREE.BoxGeometry(4.2, 10, 4.2);
    const squareBodyMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Royal Blue
      roughness: 0.3,
      metalness: 0.4,
    });
    const squareBody = new THREE.Mesh(squareBodyGeo, squareBodyMat);
    squareBody.position.y = 5;
    squareBody.castShadow = true;
    squareBody.receiveShadow = true;
    squareBody.userData = { monumentId: 'torre-cuadrada', isBuilt: true };
    torreCuadradaGroup.add(squareBody);

    // Gold 90° corner trims
    const cornerTrimGeo = new THREE.BoxGeometry(0.3, 10.1, 0.3);
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.8,
      roughness: 0.2,
    });
    [
      [-2.1, 5, -2.1],
      [2.1, 5, -2.1],
      [-2.1, 5, 2.1],
      [2.1, 5, 2.1],
    ].forEach(([x, y, z]) => {
      const trim = new THREE.Mesh(cornerTrimGeo, goldTrimMat);
      trim.position.set(x, y, z);
      torreCuadradaGroup.add(trim);
    });

    // Windows grid (cubes glowing)
    const windowGeo = new THREE.BoxGeometry(0.7, 0.7, 0.1);
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.6,
    });
    for (let floor = 1; floor <= 4; floor++) {
      for (let col = -1; col <= 1; col++) {
        const winFront = new THREE.Mesh(windowGeo, windowMat);
        winFront.position.set(col * 1.2, floor * 2, 2.12);
        torreCuadradaGroup.add(winFront);

        const winSide = new THREE.Mesh(windowGeo, windowMat);
        winSide.rotation.y = Math.PI / 2;
        winSide.position.set(2.12, floor * 2, col * 1.2);
        torreCuadradaGroup.add(winSide);
      }
    }

    // Antenna on top
    const antennaGeo = new THREE.CylinderGeometry(0.1, 0.2, 3, 8);
    const antennaMesh = new THREE.Mesh(antennaGeo, goldTrimMat);
    antennaMesh.position.y = 11.5;
    torreCuadradaGroup.add(antennaMesh);

    // Top beacon sphere
    const beaconGeo = new THREE.SphereGeometry(0.4, 12, 12);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.9,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 13;
    torreCuadradaGroup.add(beacon);

    interactiveMeshes.push(squareBody);
    islandGroup.add(torreCuadradaGroup);
  } else {
    islandGroup.add(
      createPlotHologram('torre-cuadrada', [-8, 1.25, -6], 4.2, 10, 4.2, interactiveMeshes, animState.constructionMarkers)
    );
  }

  // MONUMENT 2: GRAN PALACIO RECTANGULAR
  if (isBuilt('edificio-rectangulo')) {
    const palacioRectGroup = new THREE.Group();
    palacioRectGroup.position.set(-12, 1.25, 3);
    palacioRectGroup.userData = { monumentId: 'edificio-rectangulo', isBuilt: true };

    const rectBodyGeo = new THREE.BoxGeometry(6.5, 4.5, 3.2);
    const rectBodyMat = new THREE.MeshStandardMaterial({
      color: 0x059669, // Emerald jade
      roughness: 0.4,
      metalness: 0.3,
    });
    const rectBody = new THREE.Mesh(rectBodyGeo, rectBodyMat);
    rectBody.position.y = 2.25;
    rectBody.castShadow = true;
    rectBody.userData = { monumentId: 'edificio-rectangulo', isBuilt: true };
    palacioRectGroup.add(rectBody);

    const columnGeo = new THREE.BoxGeometry(0.5, 4.5, 0.5);
    const columnMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
    for (let c = -2.8; c <= 2.8; c += 1.4) {
      const col = new THREE.Mesh(columnGeo, columnMat);
      col.position.set(c, 2.25, 1.7);
      palacioRectGroup.add(col);
    }

    const roofGeo = new THREE.BoxGeometry(6.8, 0.4, 3.5);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 4.7;
    palacioRectGroup.add(roof);

    interactiveMeshes.push(rectBody);
    islandGroup.add(palacioRectGroup);
  } else {
    islandGroup.add(
      createPlotHologram('edificio-rectangulo', [-12, 1.25, 3], 6.5, 4.5, 3.2, interactiveMeshes, animState.constructionMarkers)
    );
  }

  // MONUMENT 3: PABELLÓN DEL ROMBO BRILLANTE
  if (isBuilt('pabellon-rombo')) {
    const romboGroup = new THREE.Group();
    romboGroup.position.set(-4, 1.25, 7);
    romboGroup.userData = { monumentId: 'pabellon-rombo', isBuilt: true };

    const romboBaseGeo = new THREE.CylinderGeometry(3.5, 4, 0.6, 4);
    romboBaseGeo.rotateY(Math.PI / 4);
    const romboBaseMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.5 });
    const romboBase = new THREE.Mesh(romboBaseGeo, romboBaseMat);
    romboBase.position.y = 0.3;
    romboGroup.add(romboBase);

    const diamondGeo = new THREE.OctahedronGeometry(2.2, 0);
    diamondGeo.scale(1, 1.6, 1);
    const diamondMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.8,
    });
    const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
    diamondMesh.position.y = 3.6;
    diamondMesh.castShadow = true;
    diamondMesh.userData = { monumentId: 'pabellon-rombo', isBuilt: true };
    romboGroup.add(diamondMesh);
    animState.diamondMesh = diamondMesh;

    const kiteGeo = new THREE.OctahedronGeometry(0.7, 0);
    kiteGeo.scale(1, 1.8, 0.1);
    const kiteMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.3 });
    const kite = new THREE.Mesh(kiteGeo, kiteMat);
    kite.position.set(0, 6.2, 0);
    romboGroup.add(kite);

    interactiveMeshes.push(diamondMesh);
    islandGroup.add(romboGroup);
  } else {
    islandGroup.add(
      createPlotHologram('pabellon-rombo', [-4, 1.25, 7], 4, 6, 4, interactiveMeshes, animState.constructionMarkers)
    );
  }

  // MONUMENT 4: AUDITORIO PARALELOGRAMO
  if (isBuilt('centro-paralelogramo')) {
    const paralelogramoGroup = new THREE.Group();
    paralelogramoGroup.position.set(-9, 1.25, 11);
    paralelogramoGroup.userData = { monumentId: 'centro-paralelogramo', isBuilt: true };

    const paraGeo = new THREE.BoxGeometry(4.5, 3.5, 3.5);
    const posAttr = paraGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const y = posAttr.getY(i);
      posAttr.setX(i, posAttr.getX(i) + (y > 0 ? 1.2 : -0.2));
    }
    paraGeo.computeVertexNormals();

    const paraMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      roughness: 0.4,
      metalness: 0.4,
    });
    const paraMesh = new THREE.Mesh(paraGeo, paraMat);
    paraMesh.position.y = 1.75;
    paraMesh.castShadow = true;
    paraMesh.userData = { monumentId: 'centro-paralelogramo', isBuilt: true };
    paralelogramoGroup.add(paraMesh);

    interactiveMeshes.push(paraMesh);
    islandGroup.add(paralelogramoGroup);
  } else {
    islandGroup.add(
      createPlotHologram('centro-paralelogramo', [-9, 1.25, 11], 4.5, 3.5, 3.5, interactiveMeshes, animState.constructionMarkers)
    );
  }

  // MONUMENT 5: VIADUCTO DE VÍAS PARALELAS (Y TREN MAGNÉTICO)
  if (isBuilt('viaducto-paralelas')) {
    const viaductoGroup = new THREE.Group();
    viaductoGroup.position.set(-2, 1.25, -9);
    viaductoGroup.userData = { monumentId: 'viaducto-paralelas', isBuilt: true };

    const railCurveR = 7;
    const railGeo1 = new THREE.TorusGeometry(railCurveR, 0.08, 8, 32, Math.PI);
    const railGeo2 = new THREE.TorusGeometry(railCurveR + 0.6, 0.08, 8, 32, Math.PI);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, metalness: 0.9, roughness: 0.2 });

    const rail1Mesh = new THREE.Mesh(railGeo1, trackMat);
    rail1Mesh.rotation.x = Math.PI / 2;
    rail1Mesh.position.y = 1.6;
    rail1Mesh.userData = { monumentId: 'viaducto-paralelas', isBuilt: true };
    viaductoGroup.add(rail1Mesh);

    const rail2Mesh = new THREE.Mesh(railGeo2, trackMat);
    rail2Mesh.rotation.x = Math.PI / 2;
    rail2Mesh.position.y = 1.6;
    viaductoGroup.add(rail2Mesh);

    const pillarGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.6, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    for (let a = 0; a <= Math.PI; a += Math.PI / 4) {
      const px = Math.cos(a) * (railCurveR + 0.3);
      const pz = Math.sin(a) * (railCurveR + 0.3);
      const pil = new THREE.Mesh(pillarGeo, pillarMat);
      pil.position.set(px, 0.8, pz);
      viaductoGroup.add(pil);
    }

    const trainGroup = new THREE.Group();
    const trainBodyGeo = new THREE.BoxGeometry(1.6, 0.6, 0.7);
    const trainBodyMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      roughness: 0.2,
    });
    const trainBody = new THREE.Mesh(trainBodyGeo, trainBodyMat);
    trainGroup.add(trainBody);

    const trainNoseGeo = new THREE.ConeGeometry(0.4, 0.7, 8);
    const trainNose = new THREE.Mesh(trainNoseGeo, trainBodyMat);
    trainNose.rotation.z = -Math.PI / 2;
    trainNose.position.x = 1.0;
    trainGroup.add(trainNose);

    trainGroup.position.set(railCurveR + 0.3, 1.9, 0);
    viaductoGroup.add(trainGroup);
    animState.trainGroup = trainGroup;

    interactiveMeshes.push(rail1Mesh);
    islandGroup.add(viaductoGroup);
  } else {
    islandGroup.add(
      createPlotHologram('viaducto-paralelas', [-2, 1.25, -9], 8, 3, 8, interactiveMeshes, animState.constructionMarkers)
    );
  }

  // MONUMENT 6: GRAN CRUCE PERPENDICULAR (Líneas 90°)
  if (isBuilt('cruce-perpendicular')) {
    const cruceGroup = new THREE.Group();
    cruceGroup.position.set(-6, 1.28, 0);
    cruceGroup.userData = { monumentId: 'cruce-perpendicular', isBuilt: true };

    const roadWGeo = new THREE.PlaneGeometry(8, 2.5);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const roadW = new THREE.Mesh(roadWGeo, roadMat);
    roadW.rotation.x = -Math.PI / 2;
    roadW.userData = { monumentId: 'cruce-perpendicular', isBuilt: true };
    cruceGroup.add(roadW);

    const roadN = roadW.clone();
    roadN.rotation.z = Math.PI / 2;
    cruceGroup.add(roadN);

    const zebraGeo = new THREE.PlaneGeometry(0.3, 2.2);
    const zebraMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    for (let z = -2.5; z <= -1.5; z += 0.4) {
      const zeb = new THREE.Mesh(zebraGeo, zebraMat);
      zeb.rotation.x = -Math.PI / 2;
      zeb.position.set(z, 0.01, 0);
      cruceGroup.add(zeb);
    }

    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3, 8);
    const pole = new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ color: 0x64748b }));
    pole.position.set(1.5, 1.5, 1.5);
    cruceGroup.add(pole);

    const lightBoxGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const lightBox = new THREE.Mesh(lightBoxGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    lightBox.position.set(1.5, 2.7, 1.5);
    cruceGroup.add(lightBox);

    interactiveMeshes.push(roadW);
    islandGroup.add(cruceGroup);
  } else {
    islandGroup.add(
      createPlotHologram('cruce-perpendicular', [-6, 1.28, 0], 6, 2, 6, interactiveMeshes, animState.constructionMarkers)
    );
  }

  // MONUMENT 7: FARO DE 90°
  if (isBuilt('faro-90')) {
    const faroGroup = new THREE.Group();
    faroGroup.position.set(0, 1.25, -11);
    faroGroup.userData = { monumentId: 'faro-90', isBuilt: true };

    const towerGeo = new THREE.CylinderGeometry(1.2, 1.8, 8, 16);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xf87171, roughness: 0.5 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 4;
    tower.castShadow = true;
    tower.userData = { monumentId: 'faro-90', isBuilt: true };
    faroGroup.add(tower);

    const ringGeo = new THREE.CylinderGeometry(1.35, 1.45, 1.2, 16);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.position.y = 3;
    const ring2 = ring1.clone();
    ring2.position.y = 5.5;
    faroGroup.add(ring1, ring2);

    const lighthouseBeams = new THREE.Group();
    lighthouseBeams.position.y = 8.5;

    const beamGeo = new THREE.ConeGeometry(2.5, 14, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });

    const beam1 = new THREE.Mesh(beamGeo, beamMat);
    beam1.rotation.x = Math.PI / 2;
    beam1.position.z = 7;
    lighthouseBeams.add(beam1);

    const beam2 = new THREE.Mesh(beamGeo, beamMat);
    beam2.rotation.z = Math.PI / 2;
    beam2.position.x = 7;
    lighthouseBeams.add(beam2);

    faroGroup.add(lighthouseBeams);
    animState.lighthouseBeams = lighthouseBeams;

    interactiveMeshes.push(tower);
    islandGroup.add(faroGroup);
  } else {
    islandGroup.add(
      createPlotHologram('faro-90', [0, 1.25, -11], 3, 8, 3, interactiveMeshes, animState.constructionMarkers)
    );
  }

  // -------------------------------------------------------------
  // 4. DISTRICT 2: ÁNGULOPARK (THE THEME PARK - EAST SIDE)
  // -------------------------------------------------------------
  const parkPavementGeo = new THREE.CircleGeometry(16, 24, -Math.PI / 2, Math.PI);
  const parkPavementMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7, // Warm festive sandstone pavers
    roughness: 0.7,
  });
  const parkPavement = new THREE.Mesh(parkPavementGeo, parkPavementMat);
  parkPavement.rotation.x = -Math.PI / 2;
  parkPavement.position.set(0.2, 1.26, 0);
  islandGroup.add(parkPavement);

  // MONUMENT 8: LA GRAN NORIA DE LOS ÁNGULOS
  if (isBuilt('noria-angulos')) {
    const noriaGroup = new THREE.Group();
    noriaGroup.position.set(9, 1.25, -5);
    noriaGroup.userData = { monumentId: 'noria-angulos', isBuilt: true };

    const aLegGeo = new THREE.CylinderGeometry(0.2, 0.3, 8.5, 8);
    const aLegMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7 });
    const leg1 = new THREE.Mesh(aLegGeo, aLegMat);
    leg1.position.set(-1.8, 4, 1.5);
    leg1.rotation.z = -0.22;
    const leg2 = new THREE.Mesh(aLegGeo, aLegMat);
    leg2.position.set(1.8, 4, 1.5);
    leg2.rotation.z = 0.22;
    const leg3 = leg1.clone();
    leg3.position.z = -1.5;
    const leg4 = leg2.clone();
    leg4.position.z = -1.5;
    noriaGroup.add(leg1, leg2, leg3, leg4);

    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(0, 7.8, 0);

    const wheelRingGeo = new THREE.TorusGeometry(5, 0.12, 12, 32);
    const wheelRingMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.3 });
    const wheelRingFront = new THREE.Mesh(wheelRingGeo, wheelRingMat);
    wheelRingFront.position.z = 0.8;
    wheelRingFront.userData = { monumentId: 'noria-angulos', isBuilt: true };
    const wheelRingBack = wheelRingFront.clone();
    wheelRingBack.position.z = -0.8;
    wheelGroup.add(wheelRingFront, wheelRingBack);

    const spokeGeo = new THREE.CylinderGeometry(0.06, 0.06, 10, 8);
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
    const gondolaColors = [0xef4444, 0xf59e0b, 0x10b981, 0x06b6d4, 0x6366f1, 0xec4899, 0x8b5cf6, 0xf97316];

    for (let s = 0; s < 4; s++) {
      const spoke = new THREE.Mesh(spokeGeo, spokeMat);
      spoke.rotation.z = (s * Math.PI) / 4;
      wheelGroup.add(spoke);
    }

    const centerDiskGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.4, 16);
    centerDiskGeo.rotateX(Math.PI / 2);
    const centerDiskMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.5,
    });
    const centerDisk = new THREE.Mesh(centerDiskGeo, centerDiskMat);
    wheelGroup.add(centerDisk);

    for (let g = 0; g < 8; g++) {
      const angle = (g * Math.PI) / 4;
      const gondolaHolder = new THREE.Group();
      gondolaHolder.position.set(Math.cos(angle) * 5, Math.sin(angle) * 5, 0);

      const gondolaBoxGeo = new THREE.BoxGeometry(1.1, 0.9, 1.2);
      const gondolaBoxMat = new THREE.MeshStandardMaterial({
        color: gondolaColors[g % gondolaColors.length],
        roughness: 0.3,
      });
      const gondolaMesh = new THREE.Mesh(gondolaBoxGeo, gondolaBoxMat);
      gondolaMesh.position.y = -0.5;
      gondolaHolder.add(gondolaMesh);

      wheelGroup.add(gondolaHolder);
      animState.ferrisGondolas.push(gondolaHolder);
    }

    noriaGroup.add(wheelGroup);
    animState.ferrisWheel = wheelGroup;

    interactiveMeshes.push(wheelRingFront);
    islandGroup.add(noriaGroup);
  } else {
    islandGroup.add(
      createPlotHologram('noria-angulos', [9, 1.25, -5], 6, 12, 6, interactiveMeshes, animState.constructionMarkers)
    );
  }

  // MONUMENT 9: MONTAÑA RUSA DE PICOS AGUDOS
  if (isBuilt('montana-aguda')) {
    const coasterGroup = new THREE.Group();
    coasterGroup.position.set(9, 1.25, 7);
    coasterGroup.userData = { monumentId: 'montana-aguda', isBuilt: true };

    const trackCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4, 0.5, -2),
      new THREE.Vector3(-2, 5.5, -1),
      new THREE.Vector3(0, 1.2, 1),
      new THREE.Vector3(2, 6.2, 2),
      new THREE.Vector3(4, 2.0, 0),
      new THREE.Vector3(2, 0.8, -3),
      new THREE.Vector3(-1, 2.5, -4),
      new THREE.Vector3(-4, 0.5, -2),
    ]);
    trackCurve.closed = true;

    const trackTubeGeo = new THREE.TubeGeometry(trackCurve, 64, 0.16, 8, true);
    const trackTubeMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.8,
      roughness: 0.2,
    });
    const trackTube = new THREE.Mesh(trackTubeGeo, trackTubeMat);
    trackTube.userData = { monumentId: 'montana-aguda', isBuilt: true };
    coasterGroup.add(trackTube);

    const coasterCart = new THREE.Group();
    const cartBodyGeo = new THREE.BoxGeometry(0.9, 0.45, 0.6);
    const cartBodyMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 0.4,
    });
    const cartBody = new THREE.Mesh(cartBodyGeo, cartBodyMat);
    coasterCart.add(cartBody);
    coasterGroup.add(coasterCart);
    animState.coasterCart = coasterCart;

    interactiveMeshes.push(trackTube);
    islandGroup.add(coasterGroup);
  } else {
    islandGroup.add(
      createPlotHologram('montana-aguda', [9, 1.25, 7], 8, 6, 8, interactiveMeshes, animState.constructionMarkers)
    );
  }

  // MONUMENT 10: SÚPER TOBOGÁN OBTUSO
  if (isBuilt('tobogan-obtuso')) {
    const toboganGroup = new THREE.Group();
    toboganGroup.position.set(14, 1.25, 2);
    toboganGroup.userData = { monumentId: 'tobogan-obtuso', isBuilt: true };

    const slideCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 6, 0),
      new THREE.Vector3(1.8, 4.5, 1.2),
      new THREE.Vector3(2.2, 2.8, -0.8),
      new THREE.Vector3(0.5, 1.2, -1.8),
      new THREE.Vector3(-1.5, 0.2, -1.2),
    ]);
    const slideGeo = new THREE.TubeGeometry(slideCurve, 32, 0.5, 12, false);
    const slideMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.2,
      metalness: 0.4,
    });
    const slide = new THREE.Mesh(slideGeo, slideMat);
    slide.userData = { monumentId: 'tobogan-obtuso', isBuilt: true };
    toboganGroup.add(slide);

    const ladderGeo = new THREE.CylinderGeometry(0.3, 0.3, 6, 8);
    const ladder = new THREE.Mesh(ladderGeo, new THREE.MeshStandardMaterial({ color: 0x64748b }));
    ladder.position.y = 3;
    toboganGroup.add(ladder);

    interactiveMeshes.push(slide);
    islandGroup.add(toboganGroup);
  } else {
    islandGroup.add(
      createPlotHologram('tobogan-obtuso', [14, 1.25, 2], 4, 6, 4, interactiveMeshes, animState.constructionMarkers)
    );
  }

  // MONUMENT 11: ARCO MONUMENTAL ÁNGULOPARK (90° Portal)
  if (isBuilt('arco-triunfo-90')) {
    const arcoGroup = new THREE.Group();
    arcoGroup.position.set(5, 1.25, 0);
    arcoGroup.userData = { monumentId: 'arco-triunfo-90', isBuilt: true };

    const archColGeo = new THREE.BoxGeometry(0.8, 4.5, 0.8);
    const archColMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.4 });
    const colLeft = new THREE.Mesh(archColGeo, archColMat);
    colLeft.position.set(0, 2.25, -2);
    const colRight = new THREE.Mesh(archColGeo, archColMat);
    colRight.position.set(0, 2.25, 2);
    arcoGroup.add(colLeft, colRight);

    const beamTopGeo = new THREE.BoxGeometry(1.0, 0.8, 5.2);
    const beamTopMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    const beamTop = new THREE.Mesh(beamTopGeo, beamTopMat);
    beamTop.position.set(0, 4.6, 0);
    beamTop.userData = { monumentId: 'arco-triunfo-90', isBuilt: true };
    arcoGroup.add(beamTop);

    const angleMarkGeo = new THREE.BoxGeometry(0.4, 0.4, 0.1);
    const angleMark = new THREE.Mesh(angleMarkGeo, new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8 }));
    angleMark.position.set(0.5, 4.0, -1.4);
    arcoGroup.add(angleMark);

    interactiveMeshes.push(beamTop);
    islandGroup.add(arcoGroup);
  } else {
    islandGroup.add(
      createPlotHologram('arco-triunfo-90', [5, 1.25, 0], 4, 5, 2, interactiveMeshes, animState.constructionMarkers)
    );
  }

  // -------------------------------------------------------------
  // 5. DECORATIVE TREES (POLYGONAL FOLIAGE)
  // -------------------------------------------------------------
  const treePositions = [
    [-14, 1.25, -5],
    [-15, 1.25, 8],
    [-4, 1.25, -13],
    [5, 1.25, -12],
    [13, 1.25, -10],
    [15, 1.25, 11],
    [3, 1.25, 12],
  ];

  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.8, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const foliageGeo = new THREE.DodecahedronGeometry(1.4, 0);
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });

  treePositions.forEach(([tx, ty, tz]) => {
    const tree = new THREE.Group();
    tree.position.set(tx, ty, tz);

    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.9;
    tree.add(trunk);

    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.y = 2.4;
    foliage.castShadow = true;
    tree.add(foliage);

    islandGroup.add(tree);
  });

  // -------------------------------------------------------------
  // 6. LOW-POLY FLOATING CLOUDS
  // -------------------------------------------------------------
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    transparent: true,
    opacity: 0.85,
  });

  for (let c = 0; c < 5; c++) {
    const cloud = new THREE.Group();
    const puffCount = 3 + Math.floor(Math.random() * 3);
    for (let p = 0; p < puffCount; p++) {
      const puffGeo = new THREE.DodecahedronGeometry(1.5 + Math.random() * 0.8, 1);
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set((p - puffCount / 2) * 1.8, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.8);
      cloud.add(puff);
    }
    const angle = (c * Math.PI * 2) / 5;
    const dist = 26 + Math.random() * 6;
    cloud.position.set(Math.cos(angle) * dist, 10 + (c % 3) * 3, Math.sin(angle) * dist);
    islandGroup.add(cloud);
    animState.floatingClouds.push(cloud);
  }

  root.add(islandGroup);

  return { group: root, animState };
}

export function updateGeometropolisAnimations(
  delta: number,
  animState: GeometropolisAnimState
) {
  animState.time += delta;
  const t = animState.time;

  // 1. Rotate ferris wheel
  if (animState.ferrisWheel) {
    animState.ferrisWheel.rotation.z += delta * 0.4;
    const wheelRot = animState.ferrisWheel.rotation.z;
    animState.ferrisGondolas.forEach((g) => {
      g.rotation.z = -wheelRot;
    });
  }

  // 2. Rotate 90° lighthouse beams
  if (animState.lighthouseBeams) {
    animState.lighthouseBeams.rotation.y += delta * 0.6;
  }

  // 3. Spin diamond atop Rombo Pavilion
  if (animState.diamondMesh) {
    animState.diamondMesh.rotation.y += delta * 0.8;
    animState.diamondMesh.position.y = 3.6 + Math.sin(t * 2) * 0.15;
  }

  // 4. Animate train along circular track
  if (animState.trainGroup) {
    animState.trainProgress = (animState.trainProgress + delta * 0.25) % Math.PI;
    const railR = 7.3;
    const tx = Math.cos(animState.trainProgress) * railR;
    const tz = Math.sin(animState.trainProgress) * railR;
    animState.trainGroup.position.set(tx, 1.9, tz);
    animState.trainGroup.rotation.y = -animState.trainProgress + Math.PI / 2;
  }

  // 5. Animate roller coaster cart
  if (animState.coasterCart) {
    animState.coasterAngle = (animState.coasterAngle + delta * 1.2) % (Math.PI * 2);
    const a = animState.coasterAngle;
    const cx = Math.sin(a) * 3.5;
    const cz = Math.cos(a) * 2.5;
    const cy = 2.5 + Math.sin(a * 2) * 2.2;
    animState.coasterCart.position.set(cx, cy, cz);
    animState.coasterCart.rotation.y = a + Math.PI / 2;
  }

  // 6. Slowly drift clouds around island
  animState.floatingClouds.forEach((cloud, idx) => {
    cloud.position.x += Math.sin(t * 0.2 + idx) * 0.02;
    cloud.position.z += Math.cos(t * 0.2 + idx) * 0.02;
  });

  // 7. Pulse and bob construction plot markers
  animState.constructionMarkers.forEach((marker, idx) => {
    marker.rotation.y += delta * 1.2;
    marker.position.y += Math.sin(t * 3 + idx) * 0.005;
  });
}
