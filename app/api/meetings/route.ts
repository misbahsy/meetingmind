import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const GET = async () => {
  try {
    const meetings = await prisma.meeting.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        rawTranscript: true,
        summary: true,
        tasks: {
          select: {
            id: true,
            task: true,
            owner: true,
            dueDate: true,
          },
        },
        decisions: {
          select: {
            id: true,
            decision: true,
            date: true,
          },
        },
        questions: {
          select: {
            id: true,
            question: true,
            status: true,
            answer: true,
          },
        },
        insights: {
          select: {
            id: true,
            insight: true,
            reference: true,
          },
        },
        deadlines: {
          select: {
            id: true,
            description: true,
            dueDate: true,
          },
        },
        attendees: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        followUps: {
          select: {
            id: true,
            description: true,
            owner: true,
          },
        },
        risks: {
          select: {
            id: true,
            risk: true,
            impact: true,
          },
        },
        agenda: {
          select: {
            id: true,
            item: true,
          },
        },
      },
    })

    return NextResponse.json(meetings, { status: 200 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch meetings.' }, { status: 500 })
  }
}
