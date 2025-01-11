import { DataManager } from './DataManager.js';
import { UIManager } from './UIManager.js';

(async function () {
    const mappings = await DataManager.getMappings();
    UIManager.init(mappings);
})();
