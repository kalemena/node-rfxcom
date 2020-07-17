/* global require: false, beforeEach: false, describe: false, it: false, expect: false,
 spyOn: false, console: false
 */
const rfxcom = require('../lib'),
    util = require('util'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Lighting3 class', function () {
    let lighting3,
        fakeSerialPort,
        device;
    beforeEach(function () {
        this.addMatchers({
            toHaveSent: matchers.toHaveSent
        });
        fakeSerialPort = new FakeSerialPort();
        device = new rfxcom.RfxCom('/dev/ttyUSB0', {
            port: fakeSerialPort
        });
        device.connected = true;
    });
    afterEach(function () {
        device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
    });
    describe('instantiation', function () {
        it('should throw an error if no subtype is specified', function () {
            expect(function () {
                lighting3 = new rfxcom.Lighting3(device);
            }).toThrow("Must provide a subtype.");
        });
    });
    describe('.switchOn', function () {
        beforeEach(function () {
            lighting3 = new rfxcom.Lighting3(device, rfxcom.lighting3.KOPPLA);
        });
        it('should send the correct bytes to the serialport', function (done) {
            let sentCommandId = NaN;
            lighting3.switchOn('1/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x08, 0x12, 0x00, 0x00, 0x00, 0x01, 0x00, 0x10, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            lighting3.switchOn(['1', '1'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x08, 0x12, 0x00, 0x00, 0x00, 0x01, 0x00, 0x10, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a switchOff command', function (done) {
            let sentCommandId = NaN;
            lighting3.switchOff(['1', '1'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x08, 0x12, 0x00, 0x00, 0x00, 0x01, 0x00, 0x1a, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a decreaseLevel command', function (done) {
            let sentCommandId = NaN;
            lighting3.decreaseLevel(['1', '1'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x08, 0x12, 0x00, 0x00, 0x00, 0x01, 0x00, 0x08, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a decreaseLevel command with a room number', function (done) {
            let sentCommandId = NaN;
            lighting3.decreaseLevel(['1', '1'], 1, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x08, 0x12, 0x00, 0x00, 0x00, 0x01, 0x00, 0x08, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an increaseLevel command', function (done) {
            let sentCommandId = NaN;
            lighting3.increaseLevel(['1', '1'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x08, 0x12, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an increaseLevel command with a room number', function (done) {
            let sentCommandId = NaN;
            lighting3.increaseLevel(['1', '1'], 1, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x08, 0x12, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a setLevel command', function (done) {
            let sentCommandId = NaN;
            lighting3.setLevel(['1', '1'], 7, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x08, 0x12, 0x00, 0x00, 0x00, 0x01, 0x00, 0x17, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception with an out of range setLevel(level)', function () {
            expect(function () {
                lighting3.setLevel(['1', '1'], 11);
            }).toThrow("Invalid level: value must be in range 0-10");
        });
        it('should accept a program command', function (done) {
            let sentCommandId = NaN;
            lighting3.program(['1', '1'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x08, 0x12, 0x00, 0x00, 0x00, 0x01, 0x00, 0x1c, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should handle a group address correctly', function (done) {
            let sentCommandId = NaN;
            lighting3.switchOn(['16', '0'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x08, 0x12, 0x00, 0x00, 0x0f, 0xff, 0x03, 0x10, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should log the bytes being sent in debug mode', function (done) {
            const debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                    port:  fakeSerialPort,
                    debug: true
                }),
                debugLight = new rfxcom.Lighting3(debugDevice, rfxcom.lighting3.KOPPLA);
            debugDevice.connected = true;
            const debugLogSpy = spyOn(debugDevice, 'debugLog');
            debugLight.switchOn(['16', '0'], done);
            expect(debugLogSpy).toHaveBeenCalledWith('Sent    : 08,12,00,00,0F,FF,03,10,00');
            debugDevice.acknowledge[0]();
        });
        it('should accept the highest system code & channel number', function (done) {
            let sentCommandId = NaN;
            lighting3.switchOn(['16', '10'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x08, 0x12, 0x00, 0x00, 0x0f, 0x00, 0x02, 0x10, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception with a badly formatted deviceId', function () {
            expect(function () {
                lighting3.switchOn('0xF09AC8');
            }).toThrow("Invalid deviceId format");
        });
        it('should throw an exception with an invalid system number', function () {
            expect(function () {
                lighting3.switchOn('17/1');
            }).toThrow("Invalid system code 17");
        });
        it('should throw an exception with an invalid channel number', function () {
            expect(function () {
                lighting3.switchOn('16/11');
            }).toThrow("Invalid channel number 11");
        });
        it('should handle no callback', function () {
            lighting3.switchOn('16/0');
            expect(fakeSerialPort).toHaveSent([0x08, 0x12, 0x00, 0x00, 0x0f, 0xff, 0x03, 0x10, 0x00]);
        });
    });
});