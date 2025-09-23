document.addEventListener('DOMContentLoaded', () => {
    // 1. 获取Waline服务器地址（仅用于浏览量）
    const walineIndexCount = document.querySelector('.waline-index-count');
    const walineUrl = walineIndexCount ? walineIndexCount.getAttribute('waline-url') : '';
    if (!walineUrl) return;

    // 2. 浏览量核心函数（稳定保留）
    function getViewCount(paths) {
        const url = `${walineUrl}/api/article?` + paths.map(p => `path=${encodeURIComponent(p)}`).join('&');
        return fetch(url)
            .then(res => res.json().catch(() => ({ errno: 1 })))
            .then(response => response.errno === 0 ? response.data : []);
    }

    function addViewCount(path) {
        fetch(`${walineUrl}/api/article`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path })
        }).catch(() => {});
    }

    // 3. 页面类型判断
    const currentPath = window.location.pathname;
    const isListPage = currentPath === '/' || currentPath.includes('/page/');
    const isPostPage = currentPath.includes('/p/');

    // 👉 列表页：只显示浏览量，隐藏评论数
    if (isListPage) {
        // 处理浏览量
        const pageViewEles = document.querySelectorAll('.waline-pageview-count');
        const paths = Array.from(pageViewEles).map(ele => ele.getAttribute('data-path')).filter(Boolean);
        
        if (paths.length) {
            getViewCount(paths).then(counts => {
                pageViewEles.forEach((ele, i) => {
                    ele.innerText = counts[i]?.time || 0;
                });
            });
        }

        // 隐藏评论数（仅列表页）
        document.querySelectorAll('.waline-comment-count').forEach(ele => {
            ele.closest('div').style.display = 'none';
        });
    }

    // 👉 文章页：显示浏览量 + 从评论区提取评论数
    if (isPostPage) {
        // 处理浏览量
        const pageViewEle = document.querySelector('.waline-pageview-count');
        if (pageViewEle) {
            const path = pageViewEle.getAttribute('data-path');
            addViewCount(path);
            getViewCount([path]).then(counts => {
                pageViewEle.innerText = counts[0]?.time || 0;
            });
        }

        // 从评论区提取真实评论数（必对）
        const timer = setInterval(() => {
            const commentCountEle = document.querySelector('#waline .wl-count');
            const targetEle = document.querySelector('.waline-comment-count');
            if (commentCountEle && targetEle) {
                clearInterval(timer);
                // 提取数字（如"3 条评论" → "3"）
                targetEle.innerText = commentCountEle.innerText.replace(/\D/g, '');
            }
        }, 300);
        // 防止无限循环，5秒后停止
        setTimeout(() => clearInterval(timer), 5000);
    }
});