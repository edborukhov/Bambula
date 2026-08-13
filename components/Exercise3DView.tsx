import React, { useMemo, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  exerciseId: string;
  exerciseName?: string;
  height?: number;
}

export function Exercise3DView({ exerciseId, exerciseName = 'Exercise', height = 350 }: Props) {
  const webViewRef = useRef<WebView>(null);
  const colorScheme = useColorScheme();

  const animationMap: Record<string, string> = {
    'bench-press': 'benchPress',
    'incline-db-press': 'benchPress',
    'dips': 'benchPress',
    'push-ups': 'benchPress',
    'leg-press': 'legPress',
    'barbell-squat': 'squat',
    'romanian-deadlift': 'squat',
    'leg-curl': 'legPress',
    'leg-extension': 'legPress',
    'barbell-curl': 'bicepCurl',
    'hammer-curl': 'bicepCurl',
    'tricep-pushdown': 'bicepCurl',
    'pull-ups': 'bicepCurl',
    'lat-pulldown': 'bicepCurl',
    'seated-cable-row': 'bicepCurl',
  };

  const animationName = animationMap[exerciseId] || 'legPress';

  const html3D = useMemo(() => `
    <!DOCTYPE html>
    <html style="margin: 0; padding: 0; width: 100%; height: 100%; background: #f5f5f5;">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        #canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div id="canvas"></div>
      
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
      <script>
        class HumanFigure {
          constructor(scene, x = 0, y = 0, z = 0) {
            this.group = new THREE.Group();
            this.group.position.set(x, y, z);
            scene.add(this.group);

            const skinMaterial = new THREE.MeshStandardMaterial({
              color: 0xd9a876,
              metalness: 0.1,
              roughness: 0.8,
            });

            const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
            this.head = new THREE.Mesh(headGeometry, skinMaterial);
            this.head.position.y = 1.7;
            this.group.add(this.head);

            const torsoGeometry = new THREE.BoxGeometry(0.3, 0.6, 0.2);
            this.torso = new THREE.Mesh(torsoGeometry, skinMaterial);
            this.torso.position.y = 1.1;
            this.group.add(this.torso);

            const pelvisGeometry = new THREE.BoxGeometry(0.35, 0.25, 0.2);
            this.pelvis = new THREE.Mesh(pelvisGeometry, skinMaterial);
            this.pelvis.position.y = 0.45;
            this.group.add(this.pelvis);

            this.leftShoulder = new THREE.Bone();
            this.leftShoulder.position.set(-0.18, 1.3, 0);
            this.group.add(this.leftShoulder);

            this.leftArm = this.createLimb(0.08, 0.35, skinMaterial);
            this.leftShoulder.add(this.leftArm);
            this.leftArm.position.y = -0.18;

            this.leftForearm = this.createLimb(0.06, 0.3, skinMaterial);
            this.leftArm.add(this.leftForearm);
            this.leftForearm.position.y = -0.35;

            this.rightShoulder = new THREE.Bone();
            this.rightShoulder.position.set(0.18, 1.3, 0);
            this.group.add(this.rightShoulder);

            this.rightArm = this.createLimb(0.08, 0.35, skinMaterial);
            this.rightShoulder.add(this.rightArm);
            this.rightArm.position.y = -0.18;

            this.rightForearm = this.createLimb(0.06, 0.3, skinMaterial);
            this.rightArm.add(this.rightForearm);
            this.rightForearm.position.y = -0.35;

            this.leftLeg = this.createLimb(0.1, 0.4, skinMaterial);
            this.leftLeg.position.set(-0.12, 0.2, 0);
            this.pelvis.add(this.leftLeg);

            this.leftCalf = this.createLimb(0.08, 0.35, skinMaterial);
            this.leftLeg.add(this.leftCalf);
            this.leftCalf.position.y = -0.4;

            this.rightLeg = this.createLimb(0.1, 0.4, skinMaterial);
            this.rightLeg.position.set(0.12, 0.2, 0);
            this.pelvis.add(this.rightLeg);

            this.rightCalf = this.createLimb(0.08, 0.35, skinMaterial);
            this.rightLeg.add(this.rightCalf);
            this.rightCalf.position.y = -0.4;
          }

          createLimb(radius, height, material) {
            const limbGeometry = new THREE.CylinderGeometry(radius, radius, height, 8);
            return new THREE.Mesh(limbGeometry, material);
          }
        }

        class ExerciseAnimator {
          constructor(figure) {
            this.figure = figure;
            this.animations = {};
            this.currentAnimation = null;
            this.animationTime = 0;
            this.animationDuration = 2;
          }

          createLegPressAnimation() {
            return {
              name: 'legPress',
              duration: 2,
              keyframes: {
                0: {
                  leftLeg: { rotation: [0.3, 0, 0] },
                  rightLeg: { rotation: [0.3, 0, 0] },
                  torso: { rotation: [0.1, 0, 0] },
                },
                1: {
                  leftLeg: { rotation: [-0.2, 0, 0] },
                  rightLeg: { rotation: [-0.2, 0, 0] },
                  torso: { rotation: [0.1, 0, 0] },
                },
                2: {
                  leftLeg: { rotation: [0.3, 0, 0] },
                  rightLeg: { rotation: [0.3, 0, 0] },
                  torso: { rotation: [0.1, 0, 0] },
                },
              },
            };
          }

          createBenchPressAnimation() {
            return {
              name: 'benchPress',
              duration: 2,
              keyframes: {
                0: {
                  leftArm: { rotation: [0, 0, 0] },
                  rightArm: { rotation: [0, 0, 0] },
                  leftForearm: { rotation: [0, 0, 0] },
                  rightForearm: { rotation: [0, 0, 0] },
                },
                0.5: {
                  leftArm: { rotation: [1.2, 0, 0] },
                  rightArm: { rotation: [1.2, 0, 0] },
                  leftForearm: { rotation: [0.8, 0, 0] },
                  rightForearm: { rotation: [0.8, 0, 0] },
                },
                1: {
                  leftArm: { rotation: [0, 0, 0] },
                  rightArm: { rotation: [0, 0, 0] },
                  leftForearm: { rotation: [0, 0, 0] },
                  rightForearm: { rotation: [0, 0, 0] },
                },
                2: {
                  leftArm: { rotation: [0, 0, 0] },
                  rightArm: { rotation: [0, 0, 0] },
                  leftForearm: { rotation: [0, 0, 0] },
                  rightForearm: { rotation: [0, 0, 0] },
                },
              },
            };
          }

          createSquatAnimation() {
            return {
              name: 'squat',
              duration: 2.5,
              keyframes: {
                0: {
                  leftLeg: { rotation: [0, 0, 0] },
                  rightLeg: { rotation: [0, 0, 0] },
                  leftCalf: { rotation: [0, 0, 0] },
                  rightCalf: { rotation: [0, 0, 0] },
                  torso: { rotation: [0, 0, 0] },
                },
                1: {
                  leftLeg: { rotation: [1.4, 0, 0] },
                  rightLeg: { rotation: [1.4, 0, 0] },
                  leftCalf: { rotation: [1.0, 0, 0] },
                  rightCalf: { rotation: [1.0, 0, 0] },
                  torso: { rotation: [0.3, 0, 0] },
                },
                2: {
                  leftLeg: { rotation: [0.4, 0, 0] },
                  rightLeg: { rotation: [0.4, 0, 0] },
                  leftCalf: { rotation: [0.2, 0, 0] },
                  rightCalf: { rotation: [0.2, 0, 0] },
                  torso: { rotation: [0.1, 0, 0] },
                },
                2.5: {
                  leftLeg: { rotation: [0, 0, 0] },
                  rightLeg: { rotation: [0, 0, 0] },
                  leftCalf: { rotation: [0, 0, 0] },
                  rightCalf: { rotation: [0, 0, 0] },
                  torso: { rotation: [0, 0, 0] },
                },
              },
            };
          }

          createBicepCurlAnimation() {
            return {
              name: 'bicepCurl',
              duration: 2,
              keyframes: {
                0: {
                  leftArm: { rotation: [0, 0, 0] },
                  rightArm: { rotation: [0, 0, 0] },
                  leftForearm: { rotation: [0, 0, 0] },
                  rightForearm: { rotation: [0, 0, 0] },
                },
                0.75: {
                  leftArm: { rotation: [0.2, 0, 0] },
                  rightArm: { rotation: [0.2, 0, 0] },
                  leftForearm: { rotation: [-1.3, 0, 0] },
                  rightForearm: { rotation: [-1.3, 0, 0] },
                },
                1.5: {
                  leftArm: { rotation: [0, 0, 0] },
                  rightArm: { rotation: [0, 0, 0] },
                  leftForearm: { rotation: [0, 0, 0] },
                  rightForearm: { rotation: [0, 0, 0] },
                },
                2: {
                  leftArm: { rotation: [0, 0, 0] },
                  rightArm: { rotation: [0, 0, 0] },
                  leftForearm: { rotation: [0, 0, 0] },
                  rightForearm: { rotation: [0, 0, 0] },
                },
              },
            };
          }

          registerAnimation(animation) {
            this.animations[animation.name] = animation;
          }

          play(name) {
            if (this.animations[name]) {
              this.currentAnimation = this.animations[name];
              this.animationTime = 0;
              this.animationDuration = this.currentAnimation.duration;
            }
          }

          update(deltaTime) {
            if (!this.currentAnimation) return;

            this.animationTime += deltaTime;
            if (this.animationTime > this.animationDuration) {
              this.animationTime = 0;
            }

            const keyframes = this.currentAnimation.keyframes;
            const keyframeKeys = Object.keys(keyframes).map(Number).sort((a, b) => a - b);

            let kf1, kf2, t1, t2;
            for (let i = 0; i < keyframeKeys.length - 1; i++) {
              if (this.animationTime >= keyframeKeys[i] && this.animationTime <= keyframeKeys[i + 1]) {
                t1 = keyframeKeys[i];
                t2 = keyframeKeys[i + 1];
                kf1 = keyframes[t1];
                kf2 = keyframes[t2];
                break;
              }
            }

            if (!kf1 || !kf2) return;

            const alpha = (this.animationTime - t1) / (t2 - t1);
            this.applyKeyframe(kf1, kf2, alpha);
          }

          applyKeyframe(kf1, kf2, alpha) {
            const limbs = [
              { key: 'leftArm', figure: this.figure.leftArm },
              { key: 'rightArm', figure: this.figure.rightArm },
              { key: 'leftForearm', figure: this.figure.leftForearm },
              { key: 'rightForearm', figure: this.figure.rightForearm },
              { key: 'leftLeg', figure: this.figure.leftLeg },
              { key: 'rightLeg', figure: this.figure.rightLeg },
              { key: 'leftCalf', figure: this.figure.leftCalf },
              { key: 'rightCalf', figure: this.figure.rightCalf },
              { key: 'torso', figure: this.figure.torso },
            ];

            limbs.forEach(({ key, figure }) => {
              if (kf1[key] && kf2[key]) {
                const rot1 = kf1[key].rotation;
                const rot2 = kf2[key].rotation;
                if (rot1 && rot2) {
                  figure.rotation.x = rot1[0] + (rot2[0] - rot1[0]) * alpha;
                  figure.rotation.y = rot1[1] + (rot2[1] - rot1[1]) * alpha;
                  figure.rotation.z = rot1[2] + (rot2[2] - rot1[2]) * alpha;
                }
              }
            });
          }
        }

        // Scene setup
        const container = document.getElementById('canvas');
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(1.5, 1.2, 2.5);
        camera.lookAt(0, 1, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.pixelRatio = window.devicePixelRatio;
        container.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(3, 4, 2);
        scene.add(directionalLight);

        const groundGeometry = new THREE.PlaneGeometry(5, 5);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        scene.add(ground);

        const figure = new HumanFigure(scene);
        const animator = new ExerciseAnimator(figure);
        animator.registerAnimation(animator.createLegPressAnimation());
        animator.registerAnimation(animator.createBenchPressAnimation());
        animator.registerAnimation(animator.createSquatAnimation());
        animator.registerAnimation(animator.createBicepCurlAnimation());

        animator.play('${animationName}');

        let lastTime = Date.now();
        function animate() {
          requestAnimationFrame(animate);
          const now = Date.now();
          const deltaTime = (now - lastTime) / 1000;
          lastTime = now;
          animator.update(deltaTime);
          renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        });
      </script>
    </body>
    </html>
  `, [animationName]);

  return (
    <View style={[styles.container, { height, backgroundColor: '#f5f5f5' }]}>
      <WebView
        key={animationName}
        ref={webViewRef}
        source={{ html: html3D }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={true}
        bounces={false}
        startInLoadingState={true}
        cacheEnabled={false}
        incognito={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#333" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});





