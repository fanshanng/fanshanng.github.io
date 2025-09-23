// 1. 页面加载完成后执行（确保DOM元素已生成）
document.addEventListener('DOMContentLoaded', () => {
    // 第一步：获取Waline服务器地址（从页脚的waline-index-count元素读取，确保和配置一致）
    const walineIndexCount = document.querySelector('.waline-index-count');
    const walineUrl = walineIndexCount ? walineIndexCount.getAttribute('waline-url') : '';
    if (!walineUrl) {
        console.error('Waline serverURL未找到，请检查页脚waline-index-count元素的waline-url属性');
        return;
    }

    // 第二步：定义「获取浏览量」函数（支持单篇/批量获取）
    function getViewCount(paths) {
        // paths：文章路径数组，如 ["/p/test1/", "/p/test2/"]
        const url = `${walineUrl}/api/article?` + paths.map(p => `path=${encodeURIComponent(p)}`).join('&');
        return fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`浏览量API请求失败：${res.status}`);
                return res.json();
            })
            .catch(err => {
                console.error('获取浏览量失败：', err);
                return []; // 失败时返回空数组，避免页面报错
            });
    }

    // 第三步：定义「上报浏览量」函数（文章页专用）
    function addViewCount(path) {
        fetch(`${walineUrl}/api/article`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: path }) // 上报当前文章路径
        }).catch(err => console.error('上报浏览量失败：', err));
    }

    // 第四步：区分「列表页」和「文章页」，执行对应的统计逻辑
    const currentPath = window.location.pathname;

    // 情况1：列表页（主页、分页页，路径为"/"或"/page/1/"等）
    const isListPage = currentPath === '/' || currentPath.includes('/page/');
    if (isListPage) {
        // 获取所有文章的浏览量元素和路径
        const pageViewEles = document.querySelectorAll('.waline-pageview-count');
        const paths = Array.from(pageViewEles).map(ele => ele.getAttribute('data-path'));
        if (paths.length > 0) {
            getViewCount(paths).then(counts => {
                // 遍历更新每个文章的浏览量
                counts.forEach((item, index) => {
                    pageViewEles[index].innerText = item?.time || 0;
                });
            });
        }
    }

    // 情况2：文章页（路径包含"/p/"，你的文章URL格式为"/p/xxx/"）
    const isPostPage = currentPath.includes('/p/');
    if (isPostPage) {
        // 获取当前文章的浏览量元素和路径
        const pageViewEle = document.querySelector('.waline-pageview-count');
        if (pageViewEle) {
            const path = pageViewEle.getAttribute('data-path');
            // 先上报浏览量，再获取最新值并更新
            addViewCount(path);
            getViewCount([path]).then(counts => {
                pageViewEle.innerText = counts[0]?.time || 0;
            });
        }
    }

    // 情况3：修复文章页页脚「总访问量」的data-path错误（见问题三）
    const indexCountEle = document.querySelector('.waline-index-count');
    if (isPostPage && indexCountEle?.getAttribute('data-path') === '/404.html') {
        // 将总访问量的data-path修正为当前文章路径
        indexCountEle.setAttribute('data-path', currentPath);
        // 获取并更新总访问量（若需要）
        fetch(`${walineUrl}/api/visits?path=${encodeURIComponent(currentPath)}`)
            .then(res => res.json())
            .then(data => {
                indexCountEle.innerText = data?.total || 0;
            });
    }
});