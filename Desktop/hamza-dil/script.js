// المتغيرات الرئيسية
const videoElement = document.getElementById('webcam-video');
const canvasElement = document.getElementById('detection-canvas');
const statusElement = document.getElementById('status');
const toggleButton = document.getElementById('toggle-button');
const logListElement = document.getElementById('detection-log-list'); 
const clearLogButton = document.getElementById('clear-log-button');   
const ctx = canvasElement.getContext('2d');

let model = undefined;
let isDetecting = false; 
let stream = null; 
let animationFrameId = null; 
let detectionLog = []; // مصفوفة لتخزين سجل الاكتشافات في الذاكرة

// ------------------------------------------
// دوال إدارة السجل (LOGGING FUNCTIONS)
// ------------------------------------------

/**
 * @function loadLog
 * @description تحميل سجل الاكتشافات من الذاكرة المحلية (localStorage).
 */
function loadLog() {
    const storedLog = localStorage.getItem('detectionLog');
    if (storedLog) {
        detectionLog = JSON.parse(storedLog);
        renderLog();
    }
}

/**
 * @function saveLog
 * @description يحفظ الاكتشافات الجديدة في الذاكرة المحلية (localStorage).
 * @param {Array<Object>} predictions - قائمة التنبؤات الحالية.
 */
function saveLog(predictions) {
    if (predictions.length > 0) {
        predictions.forEach(p => {
            const now = new Date();
            const logEntry = {
                class: p.class,
                score: Math.round(p.score * 100),
                time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
            };
            detectionLog.unshift(logEntry); 
        });

        // قصر السجل على آخر 50 اكتشافًا لتجنب الامتلاء
        detectionLog = detectionLog.slice(0, 50); 
        
        // حفظ السجل وتحديث الواجهة
        localStorage.setItem('detectionLog', JSON.stringify(detectionLog));
        renderLog();
    }
}

/**
 * @function renderLog
 * @description عرض السجل المخزّن على واجهة المستخدم.
 */
function renderLog() {
    logListElement.innerHTML = ''; // مسح العناصر القديمة
    
    if (detectionLog.length === 0) {
         logListElement.innerHTML = '<li>لا توجد اكتشافات مسجلة بعد.</li>';
         return;
    }

    detectionLog.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>تم كشف: <strong>${entry.class}</strong> بنسبة ${entry.score}%</span>
            <span class="log-time">${entry.time}</span>
        `;
        logListElement.appendChild(listItem);
    });
}

/**
 * @function clearLog
 * @description مسح السجل بالكامل من الذاكرة والواجهة.
 */
function clearLog() {
    if (confirm('هل أنت متأكد من رغبتك في مسح سجل الاكتشافات بالكامل؟')) {
        localStorage.removeItem('detectionLog');
        detectionLog = [];
        renderLog();
    }
}

// ------------------------------------------
// دوال الكشف والتحكم (CORE DETECTION FUNCTIONS)
// ------------------------------------------

/**
 * @function setupWebcam
 * @description تهيئة وتشغيل كاميرا الويب.
 * @returns {Promise<boolean>} - True إذا نجح التشغيل، False إذا فشل.
 */
async function setupWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        
        await new Promise((resolve) => {
            videoElement.onloadeddata = () => {
                canvasElement.width = videoElement.videoWidth;
                canvasElement.height = videoElement.videoHeight;
                videoElement.play(); 
                resolve();
            };
        });
        return true; 

    } catch (error) {
        statusElement.textContent = '❌ خطأ: فشل الوصول إلى الكاميرا. (تأكد من الصلاحيات)';
        return false;
    }
}

/**
 * @function detectFrame
 * @description دالة متكررة تقوم بإجراء الكشف على إطار الفيديو الحالي.
 */
function detectFrame() {
    if (!isDetecting) {
        return;
    }

    if (model && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        model.detect(videoElement).then(predictions => {
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            predictions.forEach(prediction => {
                drawBoundingBox(prediction);
            });
            
            // حفظ النتيجة في السجل
            saveLog(predictions); 

            animationFrameId = requestAnimationFrame(detectFrame);
        });
    } else {
         animationFrameId = requestAnimationFrame(detectFrame);
    }
}

/**
 * @function drawBoundingBox
 * @description ترسم مربع حول الكائن المكتشف مع اسم الكائن ونسبة الثقة.
 * @param {Object} prediction - كائن التنبؤ من COCO-SSD.
 */
function drawBoundingBox(prediction) {
    const [x, y, width, height] = prediction.bbox;
    const score = Math.round(prediction.score * 100);
    const label = prediction.class;
    
    // إعدادات الرسم
    ctx.strokeStyle = '#FF0000'; 
    ctx.lineWidth = 3;
    ctx.fillStyle = '#FF0000'; 
    ctx.font = 'bold 16px sans-serif';

    // 1. رسم المربع المحيط
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.stroke();

    // 2. رسم خلفية للنص
    const text = `${label} (${score}%)`;
    const textWidth = ctx.measureText(text).width;
    ctx.fillRect(x, y - 22, textWidth + 8, 22);

    // 3. كتابة النص
    ctx.fillStyle = '#FFFFFF'; 
    ctx.fillText(text, x + 4, y - 5);
}

/**
 * @function toggleDetection
 * @description تبديل حالة الكشف (تشغيل/إيقاف).
 */
async function toggleDetection() {
    if (isDetecting) {
        // --- وضع الإيقاف (STOP) ---
        isDetecting = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        // إيقاف بث الكاميرا فعلياً
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
        }

        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        toggleButton.textContent = '▶️ تشغيل الكشف';
        statusElement.textContent = '⏸️ تم إيقاف الكشف.';
    } else {
        // --- وضع التشغيل (START) ---
        const success = await setupWebcam();
        if (success) {
            isDetecting = true;
            toggleButton.textContent = '⏸️ إيقاف الكشف';
            statusElement.textContent = '📡 الكشف قيد التشغيل.';
            detectFrame(); 
        } else {
            isDetecting = false; 
        }
    }
}

/**
 * @function runInitialLoad
 * @description الدالة الرئيسية التي تبدأ بتحميل النموذج وتجهيز الواجهة.
 */
async function runInitialLoad() {
    // 1. تحميل السجل القديم
    loadLog(); 
    
    // 2. تحميل نموذج الذكاء الاصطناعي
    statusElement.textContent = 'جاري تحميل نموذج COCO-SSD... (حجمه كبير نسبياً).';
    try {
         model = await cocoSsd.load(); 
    } catch(e) {
        statusElement.textContent = '❌ فشل تحميل النموذج. تأكد من اتصالك بالإنترنت.';
        return;
    }
   
    // 3. تجهيز الواجهة بعد التحميل
    toggleButton.disabled = false;
    toggleButton.textContent = '▶️ تشغيل الكشف';
    statusElement.textContent = '✅ النموذج جاهز. اضغط على "تشغيل الكشف" للبدء.';
    
    // 4. إضافة مستمعي الأحداث
    toggleButton.addEventListener('click', toggleDetection);
    clearLogButton.addEventListener('click', clearLog);
}

// تشغيل الدالة الرئيسية عند تحميل الصفحة
window.onload = runInitialLoad;