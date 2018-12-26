import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
    const Nodes = new Mongo.Collection('nodes');
    const Edges = new Mongo.Collection('edges');


});
