import CourseCard from '../components/ui/CourseCard';

const CourseDemo = () => {
  const sampleCourses = [
    {
      title: "Introduction to Machine Learning",
      description: "Learn the fundamentals of ML including supervised learning, unsupervised learning, and neural networks. Perfect for beginners with basic programming knowledge.",
      progress: 75,
      tag: "ML"
    },
    {
      title: "Advanced React Patterns",
      description: "Master advanced React concepts like compound components, render props, and custom hooks. Build scalable React applications.",
      progress: 45,
      tag: "React"
    },
    {
      title: "Data Structures and Algorithms",
      description: "Comprehensive guide to common data structures and algorithms. Essential for technical interviews and problem solving.",
      progress: 90,
      tag: "DSA"
    },
    {
      title: "Python for Data Science",
      description: "Complete course on Python programming with focus on data analysis, visualization, and machine learning using popular libraries.",
      progress: 20,
      tag: "Python"
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Course Cards Demo</h1>
        <p className="text-sm text-gray-600 mt-1">Reusable course primitive component</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleCourses.map((course, index) => (
          <CourseCard
            key={index}
            title={course.title}
            description={course.description}
            progress={course.progress}
            tag={course.tag}
            onClick={() => console.log('Course clicked:', course.title)}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseDemo;