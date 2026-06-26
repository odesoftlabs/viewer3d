document.addEventListener('DOMContentLoaded', () => {
    
    // --- APP INITIALIZATION ---
    const splashScreen = document.getElementById('splash-screen');
    const appContainer = document.getElementById('app-container');
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    
    // Remove splash smoothly
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
            
            // Fix resize issue when switching back to canvas
            if (target === 'view-inicio' && engine.renderer) {
                setTimeout(resizeCanvas, 10);
            }
        });
    });

    // --- TRANSLATION ENGINE (Default: English) ---
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
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
    }

    document.querySelectorAll('input[name="app-lang"]').forEach(radio => {
        radio.addEventListener('change', (e) => changeLanguage(e.target.value));
    });

    // Theme Engine
    document.querySelectorAll('input[name="app-theme"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.documentElement.setAttribute('data-theme', e.target.value);
            // Si cambia a modo claro y el fondo 3D es oscuro, lo ajustamos sutilmente
            if (e.target.value === 'claro' && engine.scene) {
                 // Opción visual: forzar color claro
            }
        });
    });

    const colorCircles = document.querySelectorAll('.color-circle');
    colorCircles.forEach(circle => {
        circle.addEventListener('click', () => {
            colorCircles.forEach(c => c.classList.remove('active'));
            circle.classList.add('active');
            updateEngineBackground(circle.getAttribute('data-color'));
        });
    });


    // --- 3D ENGINE (THREE.JS) ---
    let engine = { scene: null, camera: null, renderer: null, controls: null, grid: null, currentModel: null };
    const container = document.getElementById('canvas-container');
    const placeholder = document.getElementById('viewer-placeholder');

    function initEngine3D() {
        engine.scene = new THREE.Scene();
        engine.scene.background = new THREE.Color('#1e1e1e'); // VS Code Default bg

        engine.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        engine.camera.position.set(0, 5, 10);

        engine.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        engine.renderer.setSize(container.clientWidth, container.clientHeight);
        engine.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        engine.renderer.shadowMap.enabled = true;
        engine.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(engine.renderer.domElement);

        engine.controls = new THREE.OrbitControls(engine.camera, engine.renderer.domElement);
        engine.controls.enableDamping = true;
        engine.controls.dampingFactor = 0.05;
        engine.controls.autoRotate = true;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        engine.scene.add(ambientLight);

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

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    function resizeCanvas() {
        if (!engine.renderer || !container) return;
        engine.camera.aspect = container.clientWidth / container.clientHeight;
        engine.camera.updateProjectionMatrix();
        engine.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function updateEngineBackground(hex) {
        if (engine.scene) engine.scene.background = new THREE.Color(hex);
    }

    document.getElementById('cfg-autorotate').addEventListener('change', (e) => {
        if (engine.controls) engine.controls.autoRotate = e.target.checked;
    });

    document.getElementById('cfg-grid').addEventListener('change', (e) => {
        if (engine.grid) engine.grid.visible = e.target.checked;
    });


    // --- LOCAL FILE PARSER ---
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault(); dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) processSelectedFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) processSelectedFile(e.target.files[0]);
    });

    function processSelectedFile(file) {
        const name = file.name;
        const sizeKb = (file.size / 1024).toFixed(2);
        const extension = name.split('.').pop().toLowerCase();

        if (!['glb', 'gltf', 'obj'].includes(extension)) {
            alert('Format not supported. Use .GLB, .GLTF, or .OBJ');
            return;
        }

        document.getElementById('stat-name-val').textContent = name;
        document.getElementById('stat-size-val').textContent = `${sizeKb} Kb`;
        document.getElementById('stat-format-val').textContent = `.${extension.toUpperCase()}`;
        
        const currentLang = document.querySelector('input[name="app-lang"]:checked').value;
        const statusEl = document.getElementById('stat-status-val');
        statusEl.textContent = translations[currentLang]["status-loading"];
        statusEl.style.color = "var(--accent)";

        const readerURL = URL.createObjectURL(file);

        if (engine.currentModel) engine.scene.remove(engine.currentModel);
        placeholder.classList.add('hidden');

        if (extension === 'glb' || extension === 'gltf') {
            new THREE.GLTFLoader().load(readerURL, (gltf) => {
                engine.currentModel = gltf.scene;
                engine.scene.add(engine.currentModel);
                postProcessingModel(engine.currentModel, currentLang);
            }, undefined, () => handleLoadError(currentLang));
        } else if (extension === 'obj') {
            new THREE.OBJLoader().load(readerURL, (obj) => {
                engine.currentModel = obj;
                engine.scene.add(engine.currentModel);
                postProcessingModel(engine.currentModel, currentLang);
            }, undefined, () => handleLoadError(currentLang));
        }

        // Auto-redirect to 3D View
        document.querySelector('[data-target="view-inicio"]').click();
    }

    function postProcessingModel(model, lang) {
        const statusEl = document.getElementById('stat-status-val');
        statusEl.textContent = translations[lang]["status-ready"];
        statusEl.style.color = "#4CAF50";

        let vertices = 0, faces = 0, triangles = 0, materials = new Set(), textures = 0;

        model.traverse((child) => {
            if (child.isMesh && child.geometry) {
                if (child.geometry.attributes.position) vertices += child.geometry.attributes.position.count;
                if (child.geometry.index) {
                    triangles += child.geometry.index.count / 3;
                    faces += child.geometry.index.count / 3;
                } else if (child.geometry.attributes.position) {
                    triangles += child.geometry.attributes.position.count / 3;
                    faces += child.geometry.attributes.position.count / 3;
                }

                if (child.material) {
                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach(mat => { materials.add(mat.uuid); if (mat.map) textures++; });
                }
            }
        });

        document.getElementById('stat-vertices-val').textContent = vertices.toLocaleString();
        document.getElementById('stat-faces-val').textContent = Math.floor(faces).toLocaleString();
        document.getElementById('stat-triangles-val').textContent = Math.floor(triangles).toLocaleString();
        document.getElementById('stat-materials-val').textContent = materials.size;
        document.getElementById('stat-textures-val').textContent = textures;

        // Perfect Camera Framing
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        engine.controls.target.copy(center);
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = engine.camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
        cameraZ *= 2.0; 

        engine.camera.position.set(center.x, center.y + (maxDim * 0.5), center.z + cameraZ);
        engine.camera.lookAt(center);
        engine.controls.update();
    }

    function handleLoadError(lang) {
        const statusEl = document.getElementById('stat-status-val');
        statusEl.textContent = translations[lang]["status-error"];
        statusEl.style.color = "#f44336";
        placeholder.classList.remove('hidden');
    }

    // --- PWA INSTALLATION SYSTEM ---
    let deferredPrompt;
    const installBtn = document.getElementById('btn-install-pwa');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.classList.remove('hidden'); // Muestra el botón en el header
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                installBtn.classList.add('hidden');
            }
            deferredPrompt = null;
        }
    });

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(err => console.error("SW Reg failed:", err));
    }
});
