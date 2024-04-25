import $ from 'jquery';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

global.$ = global.jQuery = $;
configure({ adapter: new Adapter() });