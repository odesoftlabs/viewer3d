document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONTROLADORES DE INTERFAZ GENERAL ---
    const splashScreen = document.getElementById('splash-screen');
    const appContainer = document.getElementById('app-container');
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    
    // Quitar splash screen con retraso controlado
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
            initEngine3D(); // Lanzar motor gráfico cuando la UI esté lista
        }, 600);
    }, 2200);

    // Sistema de navegación nativo entre vistas
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(view => view.classList.remove('active'));
            item.classList.add('active');
            const target = item.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
            
            // Forzar actualización de tamaño del canvas al ir a "Inicio"
            if (target === 'view-inicio' && engine.renderer) {
                resizeCanvas();
            }
        });
    });

    // --- DICCIONARIO DE TRADUCCIÓN REAL ---
    const translations = {
        es: {
            "no-model": "No hay ningún modelo cargado",
            "upload-prompt": "Toca o arrastra aquí para seleccionar un modelo 3D",
            "stats-title": "Estadísticas del Modelo",
            "file-info": "Información del Archivo",
            "stat-name": "Name",
            "stat-size": "File Size",
            "stat-format": "Format",
            "stat-status": "Enige Status",
            "status-waiting": "Esperando Archivo...",
            "status-loading": "Procesando malla...",
            "status-ready": "Motor Activo / Renderizando",
            "status-error": "Error: Archivo Corrupto",
            "geo-assets": "Geometría y Assets",
            "stat-vertices": "Vértices",
            "stat-faces": "Faces",
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
            "cfg-addons": "Configuraciones Adicionales",
            "opt-rotate": "Rotación Automática",
            "opt-grid": "Mostrar Cuadrícula",
            "cfg-bg": "Fondo del Vizualisador",
            "cfg-info": "Información del App",
            "info-version": "Versión: 1.0.0 Beta",
            "info-update": "Última Actualización: 06/04/2025",
            "info-author": "Creado por: Odesoft Studio",
            "nav-home": "Inicio",
            "nav-upload": "Subir Archivo",
            "nav-stats": "Estadísticas",
            "nav-config": "Configuración"
        },
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
            "info-version": "Version: 1.0.0 Beta",
            "info-update": "Last Update: 06/04/2025",
            "info-author": "Created by: Odesoft Studio",
            "nav-home": "Home",
            "nav-upload": "Upload File",
            "nav-stats": "Stats",
            "nav-config": "Settings"
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

    // Listener del selector de idiomas
    document.querySelectorAll('input[name="app-lang"]').forEach(radio => {
        radio.addEventListener('change', (e) => changeLanguage(e.target.value));
    });


    // --- AJUSTES DE INTERFAZ DINÁMICA (TEMA Y COLOR DE FONDO) ---
    document.querySelectorAll('input[name="app-theme"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.documentElement.setAttribute('data-theme', e.target.value);
        });
    });

    const colorCircles = document.querySelectorAll('.color-circle');
    colorCircles.forEach(circle => {
        circle.addEventListener('click', (e) => {
            if (circle.id === 'btn-custom-bg') return; // Dejar libre para desarrollo futuro de degradados
            colorCircles.forEach(c => c.classList.remove('active'));
            circle.classList.add('active');
            const colorHex = circle.getAttribute('data-color');
            updateEngineBackground(colorHex);
        });
    });


    // --- MOTOR GRÁFICO 3D REAL (THREE.JS ENVIRONMENT) ---
    let engine = {
        scene: null, camera: null, renderer: null, controls: null,
        grid: null, currentModel: null
    };
    const container = document.getElementById('canvas-container');
    const placeholder = document.getElementById('viewer-placeholder');

    function initEngine3D() {
        // Inicializar Escena
        engine.scene = new THREE.Scene();
        engine.scene.background = new THREE.Color('#06080f');

        // Inicializar Cámara
        engine.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        engine.camera.position.set(0, 5, 10);

        // Inicializar Renderizador Profesional
        engine.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        engine.renderer.setSize(container.clientWidth, container.clientHeight);
        engine.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        engine.renderer.shadowMap.enabled = true;
        engine.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(engine.renderer.domElement);

        // Controles de Órbita Óptimos para Táctil y Mouse
        engine.controls = new THREE.OrbitControls(engine.camera, engine.renderer.domElement);
        engine.controls.enableDamping = true;
        engine.controls.dampingFactor = 0.05;
        engine.controls.autoRotate = true; // Activo por defecto según UI
        engine.controls.autoRotateSpeed = 2.0;

        // Iluminación de Estudio Profesional
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        engine.scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight1.position.set(5, 10, 7);
        engine.scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
        dirLight2.position.set(-5, 5, -7);
        engine.scene.add(dirLight2);

        // Cuadrícula de Referencia de Suelo
        engine.grid = new THREE.GridHelper(20, 20, 0x3b82f6, 0x222222);
        engine.scene.add(engine.grid);

        // Bucle de Renderizado Continuo
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
        if (!engine.renderer) return;
        engine.camera.aspect = container.clientWidth / container.clientHeight;
        engine.camera.updateProjectionMatrix();
        engine.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function updateEngineBackground(hexColor) {
        if (engine.scene) {
            engine.scene.background = new THREE.Color(hexColor);
        }
    }

    // Controladores de modificadores interactivos de la vista
    document.getElementById('cfg-autorotate').addEventListener('change', (e) => {
        if (engine.controls) engine.controls.autoRotate = e.target.checked;
    });

    document.getElementById('cfg-grid').addEventListener('change', (e) => {
        if (engine.grid) engine.grid.visible = e.target.checked;
    });


    // --- MANEJO DE ARCHIVOS LOCALES EN TIEMPO REAL (PARSING) ---
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');

    // Clic en la zona activa abre el explorador nativo
    dropZone.addEventListener('click', () => fileInput.click());

    // Eventos Drag & Drop Profesionales para PC
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            processSelectedFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            processSelectedFile(e.target.files[0]);
        }
    });

    function processSelectedFile(file) {
        const name = file.name;
        const sizeKb = (file.size / 1024).toFixed(2);
        const extension = name.split('.').pop().toLowerCase();

        // Validar formato rápido
        if (!['glb', 'gltf', 'obj'].includes(extension)) {
            alert('Formato de archivo no soportado. Sube archivos .GLB, .GLTF o .OBJ');
            return;
        }

        // Actualizar UI inicial de estadísticas
        document.getElementById('stat-name-val').textContent = name;
        document.getElementById('stat-size-val').textContent = `${sizeKb} Kb`;
        document.getElementById('stat-format-val').textContent = `.${extension.toUpperCase()}`;
        
        const currentLang = document.querySelector('input[name="app-lang"]:checked').value;
        document.getElementById('stat-status-val').textContent = translations[currentLang]["status-loading"];

        // Crear una URL Blob segura para inyectar al lector binario sin usar servidores externos
        const readerURL = URL.createObjectURL(file);

        // Limpiar modelo anterior si existe
        if (engine.currentModel) {
            engine.scene.remove(engine.currentModel);
        }
        placeholder.classList.add('hidden');

        // Lanzar cargador correspondiente
        if (extension === 'glb' || extension === 'gltf') {
            const loader = new THREE.GLTFLoader();
            loader.load(readerURL, (gltf) => {
                engine.currentModel = gltf.scene;
                engine.scene.add(engine.currentModel);
                postProcessingModel(engine.currentModel, currentLang);
            }, undefined, (err) => handleLoadError(currentLang));
        } else if (extension === 'obj') {
            const loader = new THREE.OBJLoader();
            loader.load(readerURL, (obj) => {
                engine.currentModel = obj;
                engine.scene.add(engine.currentModel);
                postProcessingModel(engine.currentModel, currentLang);
            }, undefined, (err) => handleLoadError(currentLang));
        }

        // Mover automáticamente al usuario a la pestaña "Inicio" para ver el resultado
        document.querySelector('[data-target="view-inicio"]').click();
    }

    function postProcessingModel(model, lang) {
        document.getElementById('stat-status-val').textContent = translations[lang]["status-ready"];

        let vertices = 0;
        let faces = 0;
        let triangles = 0;
        let materials = new Set();
        let textures = 0;

        // Inspección analítica profunda de la estructura de nodos 3D
        model.traverse((child) => {
            if (child.isMesh) {
                const geometry = child.geometry;
                
                if (geometry) {
                    // Contar vértices reales
                    if (geometry.attributes.position) {
                        vertices += geometry.attributes.position.count;
                    }
                    // Contar caras y triángulos reales de la GPU
                    if (geometry.index) {
                        triangles += geometry.index.count / 3;
                        faces += geometry.index.count / 3;
                    } else if (geometry.attributes.position) {
                        triangles += geometry.attributes.position.count / 3;
                        faces += geometry.attributes.position.count / 3;
                    }
                }

                // Analizar assets internos
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            materials.add(mat.name || mat.uuid);
                            if (mat.map) textures++;
                        });
                    } else {
                        materials.add(child.material.name || child.material.uuid);
                        if (child.material.map) textures++;
                    }
                }
            }
        });

        // Escribir datos reales calculados en pantalla
        document.getElementById('stat-vertices-val').textContent = vertices.toLocaleString();
        document.getElementById('stat-faces-val').textContent = Math.floor(faces).toLocaleString();
        document.getElementById('stat-triangles-val').textContent = Math.floor(triangles).toLocaleString();
        document.getElementById('stat-materials-val').textContent = materials.size;
        document.getElementById('stat-textures-val').textContent = textures;

        // Autoajustar la cámara matemáticamente para encuadrar perfectamente cualquier escala de modelo
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        engine.controls.target.copy(center);
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = engine.camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));
        cameraZ *= 2.5; // Factor de resguardo visual

        engine.camera.position.set(center.x, center.y + (maxDim * 0.5), center.z + cameraZ);
        engine.camera.lookAt(center);
        engine.controls.update();
    }

    function handleLoadError(lang) {
        document.getElementById('stat-status-val').textContent = translations[lang]["status-error"];
        placeholder.classList.remove('hidden');
        alert('Error al parsear el archivo 3D. Asegúrate de que el archivo no esté corrupto.');
    }
});
