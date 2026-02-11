import { Application } from '@hotwired/stimulus';
import JsTreeController from '/jstree.stimulus.mjs';

const application = Application.start();
application.register('jstree', JsTreeController);
