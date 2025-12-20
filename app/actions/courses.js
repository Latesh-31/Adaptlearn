'use server';

import connectDB from '@/lib/db';
import Course from '@/models/Course';

export async function getUserCourses(userId) {
  try {
    await connectDB();
    
    const courses = await Course.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      courses: courses.map(course => ({
        ...course,
        _id: course._id.toString(),
        userId: course.userId.toString(),
      })),
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch courses',
      courses: [],
    };
  }
}

export async function getCourse(courseId, userId) {
  try {
    await connectDB();
    
    const course = await Course.findById(courseId).lean();
    
    if (!course) {
      throw new Error('Course not found');
    }
    
    if (course.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    return {
      success: true,
      course: {
        ...course,
        _id: course._id.toString(),
        userId: course.userId.toString(),
      },
    };
  } catch (error) {
    console.error('Error fetching course:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch course',
    };
  }
}

export async function deleteCourse(courseId, userId) {
  try {
    await connectDB();
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }
    
    if (course.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    await Course.findByIdAndDelete(courseId);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting course:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete course',
    };
  }
}
