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
    
});

function getAllNodes(){
    let allNodes = Edges.find().fetch().map(e => e.nodes);
    let allNodesFlat = [].concat.apply([], allNodes).filter(x => x !== undefined);
    return [...new Set(allNodesFlat)].sort();
}

function getNodesFrom(fromNode){

}

function getNodesBtn(fromNode, toNode){
    // Here let's do what mongoDB is not build for!
    // (a simple relational query on a self join)
    // use $lookup and aggregate
    var edges = Edges.find({
        nodes: {
            $in: [fromNode, toNode]
        }
    }).fetch();

    /*edges = Edges.aggregate({
        { $match: {
            nodes: { $in: [fromNode, toNode] }
        }},
        { $group: {

        }}
    })*/

    var results = new Set();
    for (let i = 0; i < edges.length; ++i){
        let edge = edges[i];

        let otherNode = edge.nodes.find((node) => node !== fromNode && node !== toNode);
        //if (otherNode == "22") debugger;

        let otherEdgeToOkFrom = edges.some((e2) => e2.nodes.includes(otherNode) && e2.nodes.includes(fromNode));
        let otherEdgeToOkTo = edges.some((e2) => e2.nodes.includes(otherNode) && e2.nodes.includes(toNode));

        if (otherEdgeToOkFrom && otherEdgeToOkTo){
            results.add(otherNode);
            continue;
        }
    }

    return [...results];
}

Template.knagToKnag.helpers({
    relatedNodes(){
        return getNodesBtn(fromNode, toNode);
    },
    allNodes(){
        return getAllNodes();
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

        // insert first edge if not already exists
        let alreadyExists = Edges.find({
            nodes: [fromNode, val]
        }).count();
        if (alreadyExists === 0)
            Edges.insert({
                nodes: [fromNode, val]
            });

        // insert second edge if not already exists
        let alreadyExists2 = Edges.find({
            nodes: [val, toNode]
        }).count();
        if (alreadyExists2 === 0)
            Edges.insert({
                nodes: [val, toNode]
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

        var ids = Edges.find({
            $or: [
                {nodes: [fromNode, nodeName]},
                {nodes: [nodeName, toNode]}
            ]
        }, {_id: 1});

        ids.forEach((edge) => {
            console.log(edge);
            Edges.remove({_id: edge._id});    
        });
            
    }
});


