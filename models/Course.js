import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['locked', 'active', 'completed'],
    default: 'locked',
  },
  completedAt: {
    type: Date,
  },
}, { _id: true });

const courseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  roadmap: [moduleSchema],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  weaknesses: {
    type: [String],
    default: [],
  },
  assessmentScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  currentModuleIndex: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

courseSchema.methods.unlockNextModule = function() {
  if (this.currentModuleIndex < this.roadmap.length) {
    this.roadmap[this.currentModuleIndex].status = 'active';
    if (this.currentModuleIndex > 0) {
      this.roadmap[this.currentModuleIndex - 1].status = 'completed';
      this.roadmap[this.currentModuleIndex - 1].completedAt = new Date();
    }
  }
  this.progress = Math.round((this.currentModuleIndex / this.roadmap.length) * 100);
};

courseSchema.methods.completeCurrentModule = function() {
  if (this.currentModuleIndex < this.roadmap.length) {
    this.roadmap[this.currentModuleIndex].status = 'completed';
    this.roadmap[this.currentModuleIndex].completedAt = new Date();
    this.currentModuleIndex += 1;
    
    if (this.currentModuleIndex < this.roadmap.length) {
      this.roadmap[this.currentModuleIndex].status = 'active';
    }
    
    this.progress = Math.round((this.currentModuleIndex / this.roadmap.length) * 100);
  }
};

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
