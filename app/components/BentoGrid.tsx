'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Flag, AlertCircle, Mic, Calendar, Users, List, AlertTriangle } from 'lucide-react';


const CategoryCard: React.FC<{ title: string; items: any[] }> = ({ title, items }) => {
  return (
    <div className="bg-gradient-to-br from-purple-900 to-indigo-900 shadow-lg rounded-xl p-4 border border-purple-500">
      <h2 className="text-xl font-bold mb-2 text-purple-300">{title}</h2>
      {items.length === 0 ? (
        <p className="text-gray-400">No items available.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => {
            const renderItem = () => {
              switch (title) {
                case 'Tasks':
                  return (
                    <>
                      <strong className="text-pink-400">Task:</strong> {item.task} <br />
                      <strong className="text-pink-400">Priority:</strong> {item.priority} <br />
                      <strong className="text-pink-400">Owner:</strong> {item.owner} <br />
                      <strong className="text-pink-400">Due Date:</strong> {item.due_date}
                    </>
                  );
                case 'Decisions':
                  return (
                    <>
                      <strong className="text-pink-400">Decision:</strong> {item.decision} <br />
                      <strong className="text-pink-400">Details:</strong> {item.details}
                    </>
                  );
                case 'Questions':
                  return (
                    <>
                      <strong className="text-pink-400">Question:</strong> {item.question} <br />
                      <strong className="text-pink-400">Status:</strong> {item.status} <br />
                      <strong className="text-pink-400">Answer:</strong> {item.answer}
                    </>
                  );
                case 'Insights':
                  return (
                    <>
                      <strong className="text-pink-400">Insight:</strong> {item.insight}
                    </>
                  );
                case 'Deadlines':
                  return (
                    <>
                      <strong className="text-pink-400">Deadline:</strong> {item.deadline} <br />
                      <strong className="text-pink-400">Due Date:</strong> {item.due_date}
                    </>
                  );
                case 'Attendees':
                  return (
                    <>
                      <strong className="text-pink-400">Name:</strong> {item.name} <br />
                      <strong className="text-pink-400">Role:</strong> {item.role}
                    </>
                  );
                case 'Follow-ups':
                  return (
                    <>
                      <strong className="text-pink-400">Follow-up:</strong> {item.follow_up} <br />
                      <strong className="text-pink-400">Owner:</strong> {item.owner} <br />
                      <strong className="text-pink-400">Due Date:</strong> {item.due_date}
                    </>
                  );
                case 'Risks':
                  return (
                    <>
                      <strong className="text-pink-400">Risk:</strong> {item.risk} <br />
                      <strong className="text-pink-400">Impact:</strong> {item.impact}
                    </>
                  );
                case 'Agenda':
                  return item;
                default:
                  return 'Undefined Category';
              }
            };
            return (
              <li key={index} className="bg-opacity-20 bg-purple-700 p-2 rounded-lg text-purple-100">
                {renderItem()}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const BentoGrid: React.FC<{ data: any }> = ({ data }) => {
  const gridItems = [
    { title: 'Tasks', icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Decisions', icon: Flag, color: 'bg-blue-500' },
    { title: 'Questions', icon: AlertCircle, color: 'bg-yellow-500' },
    { title: 'Insights', icon: Mic, color: 'bg-purple-500' },
    { title: 'Deadlines', icon: Calendar, color: 'bg-red-500' },
    { title: 'Attendees', icon: Users, color: 'bg-indigo-500' },
    { title: 'Follow-ups', icon: List, color: 'bg-pink-500' },
    { title: 'Risks', icon: AlertTriangle, color: 'bg-orange-500' },
  ];

  let parsedData;
  
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (error) {
      console.error('Error parsing data:', error);
      return null;
    }
  } else {
    parsedData = data;
  }

  console.log(parsedData);
  if (!parsedData || !parsedData.Breakdown) {
    console.error('Invalid data structure');
    return null;
  }

  const breakdown = parsedData.Breakdown;
  const categories = {
    Tasks: breakdown.Tasks || [],
    Decisions: breakdown.Decisions || [],
    Questions: breakdown.Questions || [],
    Insights: breakdown.Insights || [],
    Deadlines: breakdown.Deadlines || [],
    Attendees: breakdown.Attendees || [],
    'Follow-ups': breakdown['Follow-ups'] || [],
    Risks: breakdown.Risks || [],
    Agenda: breakdown.Agenda || [],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gradient-to-r from-black to-purple-900">
      {gridItems.map((item, index) => (
        <motion.div
          key={item.title}
          className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className={`p-4 ${item.color} bg-opacity-50`}>
            <item.icon className="w-8 h-8 text-white" />
          </div>
          <div className="p-4">
            <CategoryCard title={item.title} items={categories[item.title as keyof typeof categories]} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default BentoGrid;