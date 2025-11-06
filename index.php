<?php
session_start();
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>متجر حمزة - الرئيسية</title>
    <style>
        /* أنسخ تنسيقات متجرك الحالية هنا */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            direction: rtl;
            background: #f5f5f5;
        }
        
        .header {
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 1rem 2rem;
        }
        
        .nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .auth-buttons {
            display: flex;
            gap: 1rem;
        }
        
        .auth-btn {
            padding: 0.7rem 1.5rem;
            border-radius: 5px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .login-btn {
            background: #3498db;
            color: white;
        }
        
        .register-btn {
            background: #27ae60;
            color: white;
        }
        
        .auth-btn:hover {
            transform: translateY(-2px);
        }
        
        .user-welcome {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .user-menu {
            background: #2c3e50;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 5px;
        }
        
        .hero {
            text-align: center;
            padding: 4rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
    </style>
</head>
<body>
    <!-- الهيدر -->
    <header class="header">
        <div class="nav-container">
            <div class="logo">🛒 متجر حمزة</div>
            
            <?php if (isset($_SESSION['user'])): ?>
                <!-- إذا كان المستخدم مسجل الدخول -->
                <div class="user-welcome">
                    <span>مرحباً، <?php echo $_SESSION['user']; ?></span>
                    <a href="dashboard.php" class="auth-btn login-btn">لوحة التحكم</a>
                    <a href="logout.php" class="auth-btn register-btn">تسجيل الخروج</a>
                </div>
            <?php else: ?>
                <!-- إذا لم يكن مسجل الدخول -->
                <div class="auth-buttons">
                    <a href="login.php" class="auth-btn login-btn">🔐 تسجيل الدخول</a>
                    <a href="register.php" class="auth-btn register-btn">📝 إنشاء حساب</a>
                </div>
            <?php endif; ?>
        </div>
    </header>

    <!-- قسم البطل -->
    <section class="hero">
        <h1>مرحباً بك في متجر حمزة الإلكتروني</h1>
        <p>أفضل المنتجات بأفضل الأسعار</p>
        <div style="margin-top: 2rem;">
            <a href="products.php" class="auth-btn" style="background: white; color: #667eea;">🛍️ تصفح المنتجات</a>
        </div>
    </section>

    <!-- محتوى إضافي -->
    <div class="container">
        <h2>الميزات الجديدة</h2>
        <p>الآن يمكنك إنشاء حساب لتتبع طلباتك وحفظ المنتجات المفضلة!</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 2rem;">
            <div style="background: white; padding: 2rem; border-radius: 10px; text-align: center;">
                <h3>🚀 تسجيل سريع</h3>
                <p>أنشئ حسابك في ثوانٍ</p>
            </div>
            <div style="background: white; padding: 2rem; border-radius: 10px; text-align: center;">
                <h3>📊 تتبع الطلبات</h3>
                <p>تابع طلباتك بسهولة</p>
            </div>
            <div style="background: white; padding: 2rem; border-radius: 10px; text-align: center;">
                <h3>💾 حفظ المفضلة</h3>
                <p>احفظ منتجاتك المفضلة</p>
            </div>
        </div>
    </div>
</body>
</html>
