import Component from '@ember/component';
import { equal, readOnly } from '@ember/object/computed';
import { observer } from '../../-private/utils/observer';
import { scheduleOnce } from '@ember/runloop';
import { computed } from '@ember/object';

export default Component.extend({
  // Provided by subclasses
  columnMeta: null,
  columnValue: null,

  attributeBindings: ['slackAttribute:data-test-ember-table-slack'],
  classNameBindings: ['isFirstColumn', 'isFixedLeft', 'isFixedRight', 'textAlign'],

  isFirstColumn: equal('columnMeta.index', 0),
  isFixedLeft: equal('columnMeta.isFixed', 'left'),
  isFixedRight: equal('columnMeta.isFixed', 'right'),
  isSlack: readOnly('columnMeta.isSlack'),

  // prevents `data-test-ember-table-slack="false"` on non-slack cells in Ember 2.4
  slackAttribute: computed('isSlack', function() {
    return this.get('isSlack') ? true : null;
  }),

  /**
   Indicates the text alignment of this cell
  */
  textAlign: computed('columnValue.textAlign', function() {
    let textAlign = this.get('columnValue.textAlign');

    if (['left', 'center', 'right'].includes(textAlign)) {
      return `ember-table__text-align-${textAlign}`;
    }

    return null;
  }),

  // eslint-disable-next-line
  scheduleUpdateStyles: observer(
    'columnMeta.{width,offsetLeft,offsetRight}',
    'isFixedLeft',
    'isFixedRight',

    function() {
      scheduleOnce('actions', this, 'updateStyles');
    }
  ),

  updateStyles() {
    if (typeof FastBoot === 'undefined' && this.element) {
      let width = `${this.get('columnMeta.width')}px`;

      this.element.style.width = width;
      this.element.style.minWidth = width;
      this.element.style.maxWidth = width;

      const isRTL = document.querySelector('html').getAttribute('dir') === 'rtl';

      if (this.get('isFixedLeft')) {
				if (isRTL) {
					this.element.style.right = `${Math.round(this.get('columnMeta.offsetLeft'))}px`;
				} else {
					this.element.style.left = `${Math.round(this.get('columnMeta.offsetLeft'))}px`;
				}
			} else if (this.get('isFixedRight')) {
				if (isRTL) {
					this.element.style.left = `${Math.round(this.get('columnMeta.offsetRight'))}px`;
				} else {
					this.element.style.right = `${Math.round(this.get('columnMeta.offsetRight'))}px`;
				}
      }

      if (this.get('isSlack')) {
        this.element.style.paddingLeft = 0;
        this.element.style.paddingRight = 0;
        this.element.style.display = width === '0px' ? 'none' : 'table-cell';
      }
    }
  },

  didInsertElement() {
    this._super(...arguments);
    this.updateStyles();
  },
});
