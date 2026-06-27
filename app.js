document.addEventListener('DOMContentLoaded', () => {
    
    // --- APP INITIALIZATION ---
    const splashScreen = document.getElementById('splash-screen');
    const appContainer = document.getElementById('app-container');
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
            initEngine3D();
        }, 500);
    }, 2000);

    // Navigation System
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(view => view.classList.remove('active'));
            
            item.classList.add('active');
            const target = item.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
            
            if (target === 'view-inicio' && engine.renderer) {
                setTimeout(resizeCanvas, 10);
            }
        });
    });

    // --- TRANSLATION ENGINE ---
    const translations = {
        en: {
            "no-model": "No model loaded into the viewport",
            "upload-prompt": "Tap or drag here to select a 3D model file",
            "stats-title": "Model Statistics",
            "file-info": "File Information",
            "stat-name": "Name",
            "stat-size": "File Size",
            "stat-format": "Format",
            "stat-status": "Engine Status",
            "status-waiting": "Waiting for File...",
            "status-loading": "Processing mesh...",
            "status-ready": "Engine Active / Rendering",
            "status-error": "Error: Corrupted File",
            "geo-assets": "Geometry and Assets",
            "stat-vertices": "Vertices",
            "stat-faces": "Faces",
            "stat-triangles": "Triangles",
            "stat-materials": "Materials",
            "stat-textures": "Textures",
            "config-title": "Settings",
            "cfg-mode": "App Mode",
            "theme-light": "Light",
            "theme-dark": "Dark",
            "cfg-lang": "App Language",
            "lang-es": "Spanish",
            "lang-en": "English",
            "cfg-addons": "Additional Settings",
            "opt-rotate": "Auto Rotation",
            "opt-grid": "Show Grid",
            "cfg-bg": "Viewer Background",
            "cfg-info": "App Info",
            "info-version": "Version: 1.0.0 Pro",
            "info-author": "Created by: Odesoft Studio",
            "nav-home": "Home",
            "nav-upload": "Upload",
            "nav-stats": "Stats",
            "nav-config": "Settings",
            "install-app": "Install App"
        },
        es: {
            "no-model": "No hay modelo cargado en el visor",
            "upload-prompt": "Toca o arrastra aquí para seleccionar un modelo",
            "stats-title": "Estadísticas del Modelo",
            "file-info": "Información del Archivo",
            "stat-name": "Nombre",
            "stat-size": "Peso del Archivo",
            "stat-format": "Formato",
            "stat-status": "Estado del Motor",
            "status-waiting": "Esperando Archivo...",
            "status-loading": "Procesando malla...",
            "status-ready": "Motor Activo / Renderizando",
            "status-error": "Error: Archivo Corrupto",
            "geo-assets": "Geometría y Assets",
            "stat-vertices": "Vértices",
            "stat-faces": "Caras",
            "stat-triangles": "Triángulos",
            "stat-materials": "Materiales",
            "stat-textures": "Texturas",
            "config-title": "Configuración",
            "cfg-mode": "Modo de la App",
            "theme-light": "Claro",
            "theme-dark": "Oscuro",
            "cfg-lang": "Idioma de la App",
            "lang-es": "Español",
            "lang-en": "Inglés",
            "cfg-addons": "Ajustes Adicionales",
            "opt-rotate": "Rotación Automática",
            "opt-grid": "Mostrar Cuadrícula",
            "cfg-bg": "Fondo del Visor",
            "cfg-info": "Información de la App",
            "info-version": "Versión: 1.0.0 Pro",
            "info-author": "Creado por: Odesoft Studio",
            "nav-home": "Inicio",
            "nav-upload": "Subir",
            "nav-stats": "Datos",
            "nav-config": "Ajustes",
            "install-app": "Instalar App"
        }
    };

    function changeLanguage(lang) {
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translations[lang] && translations[lang][key]) el.textContent = translations[lang][key];
        });
    }

    document.querySelectorAll('input[name="app-lang"]').forEach(radio => {
        radio.addEventListener('change', (e) => changeLanguage(e.target.value));
    });

    // Theme & Engine Background
    document.querySelectorAll('input[name="app-theme"]').forEach(radio => {
        radio.addEventListener('change', (e) => document.documentElement.setAttribute('data-theme', e.target.value));
    });

    document.querySelectorAll('.color-circle').forEach(circle => {
        circle.addEventListener('click', () => {
            document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
            circle.classList.add('active');
            updateEngineBackground(circle.getAttribute('data-color'));
        });
    });

    // --- 3D ENGINE ---
    let engine = { scene: null, camera: null, renderer: null, controls: null, grid: null, currentModel: null };
    const container = document.getElementById('canvas-container');
    const placeholder = document.getElementById('viewer-placeholder');

    function initEngine3D() {
        engine.scene = new THREE.Scene();
        engine.scene.background = new THREE.Color('#1e1e1e');
        engine.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 2000);
        engine.camera.position.set(0, 5, 10);
        engine.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        engine.renderer.setSize(container.clientWidth, container.clientHeight);
        engine.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(engine.renderer.domElement);

        engine.controls = new THREE.OrbitControls(engine.camera, engine.renderer.domElement);
        engine.controls.enableDamping = true;
        engine.controls.dampingFactor = 0.08;
        engine.controls.autoRotate = true;
        // Touch-friendly: allow two-finger pan and pinch-zoom
        engine.controls.enablePan = true;
        engine.controls.enableZoom = true;
        engine.controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        };

        engine.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7);
        engine.scene.add(dirLight);

        engine.grid = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
        engine.scene.add(engine.grid);

        function animate() {
            requestAnimationFrame(animate);
            engine.controls.update();
            engine.renderer.render(engine.scene, engine.camera);
        }
        animate();

        // Resize on window resize and orientation change
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('orientationchange', () => {
            // Small delay lets the browser finish rotating before we measure
            setTimeout(resizeCanvas, 150);
        });
    }

    function resizeCanvas() {
        if (!engine.renderer) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        engine.camera.aspect = w / h;
        engine.camera.updateProjectionMatrix();
        engine.renderer.setSize(w, h);
        engine.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    function updateEngineBackground(hex) { if (engine.scene) engine.scene.background = new THREE.Color(hex); }

    document.getElementById('cfg-autorotate').addEventListener('change', (e) => engine.controls.autoRotate = e.target.checked);
    document.getElementById('cfg-grid').addEventListener('change', (e) => engine.grid.visible = e.target.checked);

    // --- FILE PARSER (200MB Limit + Extended Formats) ---
    function processSelectedFile(file) {
        const MAX_SIZE = 200 * 1024 * 1024; // 200MB limit
        if (file.size > MAX_SIZE) {
            showError('Error: File too large. Maximum size is 200MB.');
            return;
        }

        const name = file.name;
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        const extension = name.split('.').pop().toLowerCase();
        const supported = ['glb', 'gltf', 'obj'];

        if (!supported.includes(extension)) {
            showError(`Format ".${extension.toUpperCase()}" is not supported.\nSupported formats: .GLB, .GLTF, .OBJ`);
            return;
        }

        document.getElementById('stat-name-val').textContent = name;
        document.getElementById('stat-size-val').textContent = `${sizeMb} MB`;
        document.getElementById('stat-format-val').textContent = `.${extension.toUpperCase()}`;

        const currentLang = document.querySelector('input[name="app-lang"]:checked').value;
        const statusEl = document.getElementById('stat-status-val');
        statusEl.textContent = translations[currentLang]['status-loading'];

        // Revoke any previous object URL to free memory
        if (engine.currentObjectURL) {
            URL.revokeObjectURL(engine.currentObjectURL);
        }
        const readerURL = URL.createObjectURL(file);
        engine.currentObjectURL = readerURL;

        if (engine.currentModel) {
            engine.scene.remove(engine.currentModel);
            engine.currentModel = null;
        }
        placeholder.classList.add('hidden');

        function onLoadError(err) {
            console.error('Model load error:', err);
            statusEl.textContent = translations[currentLang]['status-error'];
            placeholder.classList.remove('hidden');
            showError('Failed to load model. The file may be corrupted or use unsupported features.');
        }

        // Logic for loaders
        if (extension === 'glb' || extension === 'gltf') {
            new THREE.GLTFLoader().load(
                readerURL,
                (gltf) => {
                    engine.currentModel = gltf.scene;
                    engine.scene.add(engine.currentModel);
                    postProcessingModel(engine.currentModel, currentLang);
                },
                undefined,
                onLoadError
            );
        } else if (extension === 'obj') {
            new THREE.OBJLoader().load(
                readerURL,
                (obj) => {
                    engine.currentModel = obj;
                    engine.scene.add(engine.currentModel);
                    postProcessingModel(engine.currentModel, currentLang);
                },
                undefined,
                onLoadError
            );
        }

        document.querySelector('[data-target="view-inicio"]').click();
    }

    function showError(message) {
        // Use a non-blocking notification if possible, fall back to alert
        console.error(message);
        alert(message);
    }

    // Handlers for Upload — click and drag-and-drop
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) processSelectedFile(e.target.files[0]);
        // Reset so the same file can be re-selected
        e.target.value = '';
    });

    // Drag-and-drop support
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) processSelectedFile(file);
    });

    function postProcessingModel(model, lang) {
        const statusEl = document.getElementById('stat-status-val');
        statusEl.textContent = translations[lang]['status-ready'];

        // Compute bounding box and center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Move model so its center sits at the world origin
        model.position.sub(center);

        // Fit camera to model — use the largest dimension to set distance
        const maxDim = Math.max(size.x, size.y, size.z);
        const fovRad = THREE.MathUtils.degToRad(engine.camera.fov);
        let camDistance = (maxDim / 2) / Math.tan(fovRad / 2);
        camDistance *= 1.6; // add breathing room

        // Adjust for screen aspect: on narrow screens pull back a bit more
        if (engine.camera.aspect < 1) camDistance *= (1 / engine.camera.aspect) * 0.75;

        engine.camera.position.set(0, maxDim * 0.4, camDistance);
        engine.controls.target.set(0, 0, 0);
        engine.controls.update();

        // Update stats
        let vertices = 0, faces = 0, triangles = 0, materials = new Set(), textures = new Set();
        model.traverse((child) => {
            if (child.isMesh) {
                const geo = child.geometry;
                if (geo.attributes.position) vertices += geo.attributes.position.count;
                if (geo.index) {
                    triangles += geo.index.count / 3;
                    faces += geo.index.count / 3;
                } else if (geo.attributes.position) {
                    triangles += geo.attributes.position.count / 3;
                    faces += geo.attributes.position.count / 3;
                }
                if (child.material) {
                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach(m => {
                        materials.add(m.uuid);
                        if (m.map) textures.add(m.map.uuid);
                        if (m.normalMap) textures.add(m.normalMap.uuid);
                        if (m.roughnessMap) textures.add(m.roughnessMap.uuid);
                        if (m.metalnessMap) textures.add(m.metalnessMap.uuid);
                    });
                }
            }
        });

        document.getElementById('stat-vertices-val').textContent = vertices.toLocaleString();
        document.getElementById('stat-faces-val').textContent = Math.round(faces).toLocaleString();
        document.getElementById('stat-triangles-val').textContent = Math.round(triangles).toLocaleString();
        document.getElementById('stat-materials-val').textContent = materials.size;
        document.getElementById('stat-textures-val').textContent = textures.size;
    }

    // PWA Install prompt
    let deferredInstallPrompt = null;
    const btnInstall = document.getElementById('btn-install-pwa');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        btnInstall.classList.remove('hidden');
    });

    btnInstall.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') btnInstall.classList.add('hidden');
        deferredInstallPrompt = null;
    });

    window.addEventListener('appinstalled', () => btnInstall.classList.add('hidden'));
});
