import Ember from 'ember';
import { module, test } from 'qunit';

import QueryBuilder from 'ember-flexberry-data/query/builder';
import ODataAdapter from 'ember-flexberry-data/adapters/odata';

import startApp from '../../helpers/start-app';
import config from '../../../../dummy/config/environment';

if (config.APP.testODataService) {
  const randKey = Math.floor(Math.random() * 999);
  const baseUrl = 'http://rtc-web:8081/odatatmp/ember' + randKey;
  const app = startApp();
  const store = app.__container__.lookup('service:store');

  const adapter = ODataAdapter.create();
  Ember.set(adapter, 'host', baseUrl);

  store.reopen({
    adapterFor() {
      return adapter;
    }
  });

  module('OData');

  test('reading | builder functions', (assert) => {
    assert.ok(true, 'Start test');
    let done = assert.async();

    Ember.run(() => {
      Ember.RSVP.Promise.all([
        store.createRecord('ember-flexberry-dummy-application-user', {
          name: 'Vasya',
          eMail: '1@mail.ru',
          karma: 5
        }).save(),

        store.createRecord('ember-flexberry-dummy-application-user', {
          name: 'Vasya',
          eMail: '2@mail.ru',
          karma: 3
        }).save(),

        store.createRecord('ember-flexberry-dummy-application-user', {
          name: 'Oleg',
          eMail: '3@mail.ru',
          karma: 4
        }).save()
      ])

      // from.
        .then(() => {
          let builder = new QueryBuilder(store)
            .from('ember-flexberry-dummy-application-user')
            .where('name', '==', 'Vasya');
          store.query('ember-flexberry-dummy-application-user', builder.build())
            .then((data) => {
              assert.ok(data.every(item => item.get('name') === 'Vasya') &&
                data.get('length') === 2, 'from');
            });
        })

        // orderBy.
        .then(() => {
          let builder = new QueryBuilder(store)
            .from('ember-flexberry-dummy-application-user')
            .orderBy('karma');
          store.query('ember-flexberry-dummy-application-user', builder.build())
            .then((data) => {
              let isDataCorrect = true;
              for (let i  =0; i  <data.get('length') - 1 && isDataCorrect; i++) {
                if(data.objectAt(i).get('karma') > data.objectAt(i + 1).get('karma')) { isDataCorrect = false; }
              }
              assert.ok(isDataCorrect, 'orderBy');
            });
        })
        .finally(done);
    });
  });
}
