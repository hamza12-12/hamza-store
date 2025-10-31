<script>
    // تحديد كل أزرار الشراء في الصفحة
    const buyButtons = document.querySelectorAll('.buy-button');

    // إضافة حدث عند الضغط على كل زر
    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert('✅ تم إضافة المنتج إلى السلة!');
        });
    });
</script>
