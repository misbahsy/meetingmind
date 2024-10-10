"use client"

import React from "react"
import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  Flag,
  AlertCircle,
  Lightbulb,
  Calendar,
  Users,
  List,
  AlertTriangle,
  FileText,
} from "lucide-react"
import CategoryCard from "@/components/CategoryCard"

interface CategoryItem {
  [key: string]: string
}

interface MeetingDetailsProps {
  data: {
    name: string
    description: string
    transcript: string
    summary: string
    breakdown: {
      Tasks: { task: string; owner: string; due_date: string }[]
      Decisions: { decision: string; details: string }[]
      Questions: { question: string; status: string; answer?: string }[]
      Insights: { insight: string; reference: string }[]
      Deadlines: { deadline: string; related_to: string }[]
      Attendees: { name: string; role: string }[]
      "Follow-ups": { follow_up: string; owner: string; due_date: string }[]
      Risks: { risk: string; impact: string }[]
    }
  }
}

export default function MeetingDetails({ data }: MeetingDetailsProps) {
  const categories = [
    { title: "Tasks", icon: CheckCircle, items: data.breakdown.Tasks || [], gridSpan: "col-span-2" },
    { title: "Decisions", icon: Flag, items: data.breakdown.Decisions || [], gridSpan: "col-span-2" },
    { title: "Questions", icon: AlertCircle, items: data.breakdown.Questions || [], gridSpan: "col-span-2" },
    { title: "Insights", icon: Lightbulb, items: data.breakdown.Insights || [], gridSpan: "col-span-2" },
    { title: "Deadlines", icon: Calendar, items: data.breakdown.Deadlines || [], gridSpan: "col-span-1" },
    { title: "Attendees", icon: Users, items: data.breakdown.Attendees || [], gridSpan: "col-span-1" },
    { title: "Follow-ups", icon: List, items: data.breakdown["Follow-ups"] || [], gridSpan: "col-span-2" },
    { title: "Risks", icon: AlertTriangle, items: data.breakdown.Risks || [], gridSpan: "col-span-2" },
  ]

  return (
    <div className="container mx-auto p-6 bg-background">
      <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
      <p className="text-muted-foreground mb-6">{data.description}</p>
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{data.summary}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>Transcript</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <p>{data.transcript}</p>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="details">
          <div className="grid grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                className={category.gridSpan}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CategoryCard
                  title={category.title}
                  items={category.items}
                  gridSpan={category.gridSpan}
                />
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
