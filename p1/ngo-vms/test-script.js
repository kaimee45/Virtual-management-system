import fs from 'fs';
const htmlPath = './index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Inject error catcher if not present
if (!html.includes('id="error-catcher"')) {
    html = html.replace('<body>', `<body>
    <div id="error-catcher" style="position:fixed; top:0; left:0; width:100%; z-index:9999; background:red; color:white; padding:20px; font-family:monospace; display:none; white-space:pre-wrap;"></div>
    <script>
      window.addEventListener('error', function(event) {
        if (!event.message.includes('ResizeObserver')) {
            const errDiv = document.getElementById('error-catcher');
            errDiv.style.display = 'block';
            errDiv.textContent += event.message + '\\n' + (event.error && event.error.stack ? event.error.stack : '') + '\\n\\n';
        }
      });
      console.error = new Proxy(console.error, {
        apply(target, thisArg, [...args]) {
          const errDiv = document.getElementById('error-catcher');
          errDiv.style.display = 'block';
          errDiv.textContent += args.join(' ') + '\\n';
          target.apply(thisArg, args);
        }
      });
    </script>`);
    fs.writeFileSync(htmlPath, html);
    console.log("Injected error catcher!");
}
