import _ from 'lodash';
import expect from 'expect.js';
import sinon from 'sinon';

import states from '../states';
import Status from '../status';
import ServerStatus from '../server_status';

describe('ServerStatus class', function () {
  const plugin = {id: 'name', version: '1.2.3'};

  let server;
  let serverStatus;

  beforeEach(function () {
    server = { expose: sinon.stub(), log: sinon.stub() };
    serverStatus = new ServerStatus(server);
  });

  describe('#create(plugin)', function () {
    it('should create a new status by plugin', function () {
      let status = serverStatus.create(plugin);
      expect(status).to.be.a(Status);
    });
  });

  describe('#get(name)', function () {
    it('exposes plugins by its id/name', function () {
      let status = serverStatus.create(plugin);
      expect(serverStatus.get('name')).to.be(status);
    });
  });

  describe('#getState(name)', function () {
    it('should expose the state of the plugin by name', function () {
      let status = serverStatus.create(plugin);
      status.green();
      expect(serverStatus.getState('name')).to.be('green');
    });
  });

  describe('#overall()', function () {
    it('considers each status to produce a summary', function () {
      let status = serverStatus.create(plugin);

      expect(serverStatus.overall().state).to.be('uninitialized');

      let match = function (overall, state) {
        expect(overall).to.have.property('state', state.id);
        expect(overall).to.have.property('title', state.title);
        expect(overall).to.have.property('icon', state.icon);
        expect(overall).to.have.property('icon', state.icon);
        expect(state.nicknames).contain(overall.nickname);
      };

      status.green();
      match(serverStatus.overall(), states.get('green'));

      status.yellow();
      match(serverStatus.overall(), states.get('yellow'));

      status.red();
      match(serverStatus.overall(), states.get('red'));
    });
  });


  describe('#toJSON()', function () {
    it('serializes to overall status and individuals', function () {
      const pluginOne = {id: 'one', version: '1.0.0'};
      const pluginTwo = {id: 'two', version: '2.0.0'};
      const pluginThree = {id: 'three', version: '3.0.0'};

      let one = serverStatus.create(pluginOne);
      let two = serverStatus.create(pluginTwo);
      let three = serverStatus.create(pluginThree);

      one.green();
      two.yellow();
      three.red();

      let obj = JSON.parse(JSON.stringify(serverStatus));
      expect(obj).to.have.property('overall');
      expect(obj.overall.state).to.eql(serverStatus.overall().state);
      expect(obj.statuses).to.have.length(3);

      let outs = _.indexBy(obj.statuses, 'name');
      expect(outs.one).to.have.property('state', 'green');
      expect(outs.two).to.have.property('state', 'yellow');
      expect(outs.three).to.have.property('state', 'red');
    });
  });

});
