import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
//import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';

//const Nodes = new Mongo.Collection('nodes');
const Edges = new Mongo.Collection('edges');

import './main.html';

var url = new URL(window.location.href);
const fromNode = url.searchParams.get("from");
const toNode = url.searchParams.get("to");


Template.knagToKnag.onCreated(function(){
    //document.getElementById('newKnag').focus();
    //console.log(this.props)

});

function getEdges(fromNode, toNode = ""){
    return Edges.find({});
}

function getNodes(fromNode, toNode = ""){
    var nodeNames = new Set()
    var edges = getEdges(fromNode, toNode);
    edges.forEach((doc) => {
        nodeNames.add(doc.f);
        nodeNames.add(doc.t);
    });
    return [...nodeNames];
}

Template.knagToKnag.helpers({
    relatedNodes(){
        return getNodes({
            $or: [
                {f: fromNode, t: toNode},
                {f: toNode, f: fromNode}
            ]
        });
    },
    nodes(){
        return Nodes.find({});
    },
    edges(){
        return Edges.find({
            
        });
    },

    fromNode(){
        return fromNode;
    },
    toNode(){
        return toNode;
    }
});

/*Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});*/

/*Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});*/

Template.knagToKnag.events({
    'submit .newKnagForm': function(e, template){
        e.preventDefault();
        
        let val = document.getElementById('newKnag').value;
        if (val === "") return;

        /*Nodes.insert({
            name: val
        });*/
        Edges.insert({
            f: fromNode,
            t: val
        });
        Edges.insert({
            f: val,
            t: toNode
        });
        
    },

    'submit .showKnags': function(e){
        e.preventDefault();

        const newKnagFrom = document.getElementById('knag1').value;
        const newKnagTo = document.getElementById('knag2').value;
        if (! newKnagFrom) return;

        // Change location
        url.searchParams.set('from', newKnagFrom);
        url.searchParams.set('to', newKnagTo);

        window.location.href = window.location.origin + url.search;
    },

    'click .deleteNode': function(e){
        e.preventDefault();

        const nodeName = e.target.getAttribute('data-node');
        /*const node = Nodes.findOne({
            name: nodeName
        });
        Nodes.remove({
            _id : node._id
        });*/
        var ids = Edges.find({
            t: nodeName,
            f: [fromNode, toNode]
        }, {_id: 1}).fetch();
        if (ids.length > 0)
            Edges.remove({_id: ids});

        ids = Edges.find({
            t: [fromNode, toNode],
            f: nodeName
        }, {_id: 1}).fetch();
        if (ids.length > 0)
            Edges.remove({_id: ids});
    }
});


