javascript:(() => {

    String.prototype.toTitleCase = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    document.querySelector('[role="menuitemradio"]').click();
    let data = [];

    init();

    function init() {
        
        setTimeout(() => {
            try {

                parseBody(() => {
                    document.querySelector('.page-item.active').nextElementSibling.querySelector('a').click();
                    init();
                });
                
            } catch (error) {
                return parseData(data);
            }
        }, 50);
            
    }

    

    function parseBody(cb) {

        document.querySelectorAll('.transactions-table tbody tr').forEach(row => {
            let split = row.innerText.replace(/\n/g, '~').replace(/\s+/g, ' ').split('~');
            let date = split[0].trim();
            let title = split[1].trim();
            let price = split[2].trim();
            let temp = {
                timestamp: new Date(date).getTime(),
                date: date,
                title: title,
                price: price
            };
            data.push(temp);
        });

        cb && cb();
    }

    function parseData(data) {
        let filtered = {
            arena: [],
            packs: [],
            other: [],
            gold: [],
            adventure: [],
            expansion: []
        };
        filtered.packs['packs'] = 0;
        data.forEach(item => {
            if (item.title.toLowerCase().indexOf('arena') >= 0) {
                item.price = 215;
                filtered.arena.push(item);
            } else if(item.price.toLowerCase().indexOf('gold') >= 0) {
                item.price = parseInt(item.price.replace(',', ''));
                filtered.gold.push(item);
            } else if(item.title.toLowerCase().indexOf('wings') >= 0 
                        || item.title.toLowerCase().indexOf('naxx') >= 0 
                        || item.title.toLowerCase().indexOf('dalaran heist') >= 0) {
                if (item.title.toLowerCase().indexOf('blackrock') >= 0) {
                    item.price = 2705;
                } else if (item.title.toLowerCase().indexOf('frostwyrm lair') >= 0 
                            || item.title.toLowerCase().indexOf('Construct Quarter') >= 0
                            || item.title.toLowerCase().indexOf('Military Quarter') >= 0
                            || item.title.toLowerCase().indexOf('Plague Quarter') >= 0
                            || item.title.toLowerCase().indexOf('Arachnid Quarter') >= 0
                          ) {
                    item.price = (6.99*1.0825)*100
                } else {
                    item.price = 2164;
                }
                filtered.adventure.push(item);
            } else if(item.title.toLowerCase().indexOf('pre-purchase') >= 0 || item.title.toLowerCase().indexOf('mega') >= 0) {
                item.price = parseFloat(item.price.replace('$', '')) >= 0 ? parseFloat(item.price.replace('$', ''))*100 : 5411;
                if(item.title.toLowerCase().indexOf('mega') >= 0) item.price = 8659;
                filtered.expansion.push(item);
            } else if(item.title.toLowerCase().indexOf('packs') >= 0) {
                let split = item.title.split(' ');
                let packs = parseInt(item.title.split(' ')[1]);
                if (packs > 0) {
                    if (packs === 7) (item.price = 9.99);
                    if (packs === 2) (item.price = 2.99);
                    if (packs === 15) (item.price = 19.99);
                    if (packs === 40) (item.price = 49.99);
                    if (packs === 60) (item.price = 69.99);
                    item.price = (item.price * 1.0825)*100;
                }
                if(item.title.toLowerCase().indexOf('welcome bundle') >= 0) item.price = 540;
                if(item.title.toLowerCase().indexOf('mammoth bundle') >= 0) item.price = (19.99*1.0825)*100;
                if(item.title.toLowerCase().indexOf('multiple expansions') >= 0) item.price = 1080;
                
                split.forEach(word => {
                    if (parseInt(word) > 0) {
                        filtered.packs.packs += parseInt(word);
                    }
                });

                filtered.packs.push(item);
            } else {
                if (item.title.toLowerCase().indexOf('khadgar') >= 0) {
                    item.price = parseInt((4.99*1.0825)*100);
                } else {
                    item.price = parseFloat(item.price.replace('$', ''))*100;
                }
                filtered.other.push(item);
            }
        });
        
        filtered.packs.packs = Math.round(filtered.packs.packs);
        init_UI(filtered);
    }

    function init_UI(data) {
        document.querySelector('.nav-tabs').style.display = 'none';
        document.querySelector('form').style.display = 'none';
        document.querySelector('.pagination').style.display = 'none';
        document.querySelector('table thead').children[0].children[3].remove();
        let table = document.querySelector('table').outerHTML;
        document.querySelector('table thead').children[0].children[0].innerText = 'Date';
        document.querySelector('table thead').children[0].children[0].style.width = '17%';
        document.querySelector('table thead').children[0].children[1].innerText = 'Title';
        document.querySelector('table thead').children[0].children[3].innerText = 'Type';
        document.querySelector('table tbody').innerHTML = '';
        let html = '';
        window.total = 0;
        Object.keys(data).forEach(type => {
            html += generateTypeTable(type, data[type]);
        });
        document.querySelector('table tbody').innerHTML = html;
        window.total = (window.total/100).toFixed(2);
        document.querySelector('h1').innerHTML = `
            Total: <span style="color: green;">$${window.total}</span>
        `;
        generateSummary(data);
    }

    function generateSummary(data) {
        let html = `
            <table style="margin-top:20px;" class="table b-table table-hover table-dark transactions-table thead-no-border thead-text-normal card-background-color">
                <tbody>
                    <tr>
                        <td>Arenas</td>
                        <td style="color:yellow">$${(data.arena.total/100).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Packs x <span style="font-weight:bold;">${data.packs.packs}</span></td>
                        <td style="color:yellow">$${(data.packs.total/100).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Others</td>
                        <td style="color:yellow">$${(data.other.total/100).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Gold Used</td>
                        <td style="color:yellow">${data.gold.total}</td>
                    </tr>
                    <tr>
                        <td>Adventures</td>
                        <td style="color:yellow">$${(data.adventure.total/100).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Expansions</td>
                        <td style="color:yellow">$${(data.expansion.total/100).toFixed(2)}</td>
                    </tr>
                <tbody>
            </table>
        `;

        document.querySelector('h1').insertAdjacentHTML('afterend', html);
        console.log(data);
    }

    function generateTypeTable(type, data) {
        let html = '';
        let total = 0;
        let totalGold = 0;

        data.forEach(item => {
            html += `
            <tr>
                <td>${item.date}</td>
                <td>${item.title}</td>
                <td>${type === 'gold' ? item.price : '$'+(item.price/100).toFixed(2)}</td>
                <td>${type.toTitleCase()}</td>
            </tr>
            `;
            if (type !== 'gold') total += item.price;
            if (type === 'gold') totalGold += item.price;
        });

        data.total = total;
        window.total += total;
        if (type === 'gold') data.total = totalGold;
        return html;
    }

})();
