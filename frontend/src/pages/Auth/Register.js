import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

// Redux
import { register as registerUser, clearError } from '../../store/slices/authSlice';
import { selectAuthLoading, selectAuthError } from '../../store/slices/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({});
  
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    reset,
  } = useForm();

  const watchedRole = watch('role');
  const watchedPassword = watch('password');

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics and Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Other',
  ];

  const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Lab Assistant',
    'Research Scholar',
    'Guest Faculty',
    'Other',
  ];

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 1:
        return ['firstName', 'lastName', 'email'];
      case 2:
        return ['role'];
      case 3:
        if (watchedRole === 'student') {
          return ['studentId', 'department', 'year', 'semester'];
        } else if (watchedRole === 'faculty') {
          return ['employeeId', 'designation', 'department'];
        }
        return [];
      case 4:
        return ['password', 'confirmPassword'];
      default:
        return [];
    }
  };

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const userData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
      };

      // Add role-specific data
      if (data.role === 'student') {
        userData.studentId = data.studentId;
        userData.department = data.department;
        userData.year = parseInt(data.year);
        userData.semester = parseInt(data.semester);
      } else if (data.role === 'faculty') {
        userData.employeeId = data.employeeId;
        userData.designation = data.designation;
        userData.department = data.department;
      }

      await dispatch(registerUser(userData)).unwrap();
      
      toast.success('Registration successful! Welcome to CampusPro+!');
      navigate('/', { replace: true });
    } catch (error) {
      // Error is handled by Redux and toast is shown via useEffect
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: {
        duration: 0.3,
      },
    },
  };

  const renderProgressBar = () => {
    const steps = ['Basic Info', 'Role', 'Details', 'Security'];
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                  index + 1 <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {index + 1 < currentStep ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-20 mx-2 transition-colors duration-200 ${
                    index + 1 < currentStep
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1]}
          </span>
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <motion.div
      key="step1"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            className="form-input"
            placeholder="John"
            {...register('firstName', {
              required: 'First name is required',
              minLength: {
                value: 2,
                message: 'First name must be at least 2 characters',
              },
            })}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            className="form-input"
            placeholder="Doe"
            {...register('lastName', {
              required: 'Last name is required',
              minLength: {
                value: 2,
                message: 'Last name must be at least 2 characters',
              },
            })}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="form-input pl-10"
            placeholder="john.doe@college.edu"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          I am a...
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="relative cursor-pointer">
            <input
              type="radio"
              value="student"
              className="sr-only"
              {...register('role', { required: 'Please select your role' })}
            />
            <div className={`p-4 border-2 rounded-lg transition-all duration-200 ${
              watchedRole === 'student'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
              <div className="flex items-center space-x-3">
                <AcademicCapIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Student</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    I'm here to learn and grow
                  </p>
                </div>
              </div>
            </div>
          </label>

          <label className="relative cursor-pointer">
            <input
              type="radio"
              value="faculty"
              className="sr-only"
              {...register('role', { required: 'Please select your role' })}
            />
            <div className={`p-4 border-2 rounded-lg transition-all duration-200 ${
              watchedRole === 'faculty'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
              <div className="flex items-center space-x-3">
                <BuildingOfficeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Faculty</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    I'm here to teach and guide
                  </p>
                </div>
              </div>
            </div>
          </label>
        </div>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.role.message}
          </p>
        )}
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      {watchedRole === 'student' ? (
        <>
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Student ID
            </label>
            <input
              id="studentId"
              type="text"
              className="form-input"
              placeholder="CS2021001"
              {...register('studentId', {
                required: 'Student ID is required',
              })}
            />
            {errors.studentId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.studentId.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <select
              id="department"
              className="form-input"
              {...register('department', {
                required: 'Department is required',
              })}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.department.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Year
              </label>
              <select
                id="year"
                className="form-input"
                {...register('year', {
                  required: 'Year is required',
                })}
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
              {errors.year && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.year.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Semester
              </label>
              <select
                id="semester"
                className="form-input"
                {...register('semester', {
                  required: 'Semester is required',
                })}
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
              {errors.semester && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.semester.message}
                </p>
              )}
            </div>
          </div>
        </>
      ) : watchedRole === 'faculty' ? (
        <>
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Employee ID
            </label>
            <input
              id="employeeId"
              type="text"
              className="form-input"
              placeholder="FAC001"
              {...register('employeeId', {
                required: 'Employee ID is required',
              })}
            />
            {errors.employeeId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.employeeId.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="designation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Designation
            </label>
            <select
              id="designation"
              className="form-input"
              {...register('designation', {
                required: 'Designation is required',
              })}
            >
              <option value="">Select Designation</option>
              {designations.map((desig) => (
                <option key={desig} value={desig}>
                  {desig}
                </option>
              ))}
            </select>
            {errors.designation && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.designation.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="facultyDepartment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <select
              id="facultyDepartment"
              className="form-input"
              {...register('department', {
                required: 'Department is required',
              })}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.department.message}
              </p>
            )}
          </div>
        </>
      ) : null}
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      key="step4"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockClosedIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="form-input pl-10 pr-10"
            placeholder="Enter your password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain uppercase, lowercase, and number',
              },
            })}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockClosedIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            className="form-input pl-10 pr-10"
            placeholder="Confirm your password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === watchedPassword || 'Passwords do not match',
            })}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-6">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Join CampusPro+
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create your account and start your journey
          </p>
        </div>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex space-x-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Next
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <CheckIcon className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Sign in link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
