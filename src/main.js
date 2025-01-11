import { UIManager } from './UIManager.js';
import { DataManager } from './DataManager.js';

(async () => {
    const mappings = await DataManager.getMappings();
    UIManager.init(mappings);

    document.getElementById('add-mapping-btn').addEventListener('click', () => {
        UIManager.addMapping(mappings);
    });
})();
