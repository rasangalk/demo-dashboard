'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
}

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  // Timer state
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const two = (n: number) => n.toString().padStart(2, '0');
    return hours > 0
      ? `${two(hours)}:${two(minutes)}:${two(seconds)}`
      : `${two(minutes)}:${two(seconds)}`;
  };

  useEffect(() => {
    async function fetchQuestions() {
      setIsLoading(true);
      try {
        // Get parameters from URL
        const subject = searchParams.get('subject');
        const allModules = searchParams.get('allModules');
        const modules = searchParams.getAll('modules');
        const allSubModules = searchParams.get('allSubModules');
        const subModules = searchParams.getAll('subModules');
        const allQuestions = searchParams.get('allQuestions');
        const numberOfQuestions = searchParams.get('numberOfQuestions');

        // Construct API URL with query parameters
        const apiUrl = new URL('/api/quiz', window.location.origin);

        if (subject) apiUrl.searchParams.append('subject', subject);
        if (allModules) apiUrl.searchParams.append('allModules', 'true');

        modules.forEach((moduleId) => {
          apiUrl.searchParams.append('modules', moduleId);
        });

        if (allSubModules) apiUrl.searchParams.append('allSubModules', 'true');

        subModules.forEach((subModuleId) => {
          apiUrl.searchParams.append('subModules', subModuleId);
        });

        if (allQuestions) {
          apiUrl.searchParams.append('allQuestions', 'true');
        } else if (numberOfQuestions) {
          apiUrl.searchParams.append('limit', numberOfQuestions);
        }

        // Fetch questions
        const response = await fetch(apiUrl.toString());

        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        setQuestions(data);
        // Initialize timer when questions first load (only once per quiz run)
        if (!startTime && data.length > 0) {
          setStartTime(Date.now());
          setElapsedMs(0);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        // Show error message to user
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuestions();
  }, [searchParams, startTime]);

  // Timer interval effect
  useEffect(() => {
    if (startTime && !quizCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, quizCompleted]);

  const currentQuestion = questions[currentQuestionIndex];

  // One-click lock: ignore further changes after first selection per question
  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (selectedOptions[questionId]) return; // already answered
    setSelectedOptions((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate score using isCorrect flags
      let correctAnswers = 0;
      Object.entries(selectedOptions).forEach(([questionId, optionId]) => {
        const question = questions.find((q) => q.id === questionId);
        const option = question?.options.find((o) => o.id === optionId);
        if (option?.isCorrect) correctAnswers++;
      });
      setScore(correctAnswers);
      // Ensure final elapsed time captured exactly at completion
      if (startTime) {
        setElapsedMs(Date.now() - startTime);
      }
      setQuizCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptions({});
    setQuizCompleted(false);
    setStartTime(Date.now());
    setElapsedMs(0);
  };

  const handleExit = () => {
    router.push('/attempt-questions');
  };

  if (isLoading) {
    return (
      <div className='container mx-auto py-8 flex items-center justify-center min-h-[80vh]'>
        <Card className='w-full max-w-3xl'>
          <CardContent className='p-8 text-center'>
            <p className='text-lg'>Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className='container mx-auto py-8 flex items-center justify-center min-h-[80vh]'>
        <Card className='w-full max-w-3xl'>
          <CardHeader>
            <CardTitle>No Questions Found</CardTitle>
            <CardDescription>
              There are no questions matching your criteria.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleExit}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className='container mx-auto py-8 flex items-center justify-center min-h-[80vh]'>
        <Card className='w-full max-w-3xl'>
          <CardHeader>
            <CardTitle>Quiz Completed</CardTitle>
            <CardDescription>
              You&apos;ve completed the quiz. Here&apos;s your score.
            </CardDescription>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='text-center py-8'>
              <p className='text-xl mb-2'>Your Score</p>
              <p className='text-4xl font-bold'>
                {score} / {questions.length}
              </p>
              <p className='text-lg mt-4'>
                {(score / questions.length) * 100}% Correct
              </p>
              <p className='text-sm mt-4 text-muted-foreground'>
                Time Taken: {formatTime(elapsedMs)}
              </p>
            </div>

            {/* Review answers section could be added here */}
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button onClick={handleRestart} variant='outline'>
              Restart Quiz
            </Button>
            <Button onClick={handleExit}>Exit</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedOptions).length;

  return (
    <div className='container mx-auto py-8 flex flex-col lg:flex-row gap-6'>
      {/* Main Question Panel */}
      <div className='flex-1'>
        <Card className='w-full max-w-3xl'>
          <CardHeader>
            <div className='flex justify-between items-center'>
              <div>
                <CardTitle>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardTitle>
                <CardDescription>Select the correct answer</CardDescription>
              </div>
              <div className='bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full'>
                {currentQuestionIndex + 1}/{questions.length}
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-6'>
            {currentQuestion && (
              <>
                <div className='mb-6'>
                  <h3 className='text-lg font-medium mb-4'>
                    {currentQuestion.text}
                  </h3>

                  <RadioGroup
                    value={selectedOptions[currentQuestion.id] || ''}
                    onValueChange={(value: string) =>
                      handleOptionSelect(currentQuestion.id, value)
                    }
                  >
                    <div className='space-y-3'>
                      {currentQuestion.options.map((option, idx) => {
                        const letter = String.fromCharCode(97 + idx); // a, b, c ...
                        const answered = !!selectedOptions[currentQuestion.id];
                        const selected =
                          selectedOptions[currentQuestion.id] === option.id;
                        const correct = option.isCorrect;
                        let stateClasses = 'border-muted';
                        if (answered) {
                          if (correct) {
                            stateClasses =
                              'border-green-500 bg-green-100 dark:bg-green-900/30';
                          } else if (selected) {
                            stateClasses =
                              'border-red-500 bg-red-100 dark:bg-red-900/30';
                          } else {
                            stateClasses = 'opacity-60';
                          }
                        }
                        return (
                          <div
                            key={option.id}
                            className={`flex items-center space-x-2 p-3 rounded-md border transition-colors ${stateClasses} ${
                              answered ? 'cursor-not-allowed' : ''
                            }`}
                          >
                            <RadioGroupItem
                              value={option.id}
                              id={option.id}
                              disabled={answered && !selected}
                            />
                            <label
                              htmlFor={option.id}
                              className={`flex-grow flex items-start ${
                                answered ? 'cursor-default' : 'cursor-pointer'
                              }`}
                            >
                              <span className='font-medium mr-2 uppercase'>
                                {letter})
                              </span>
                              <span>{option.text}</span>
                            </label>
                            {answered && correct && (
                              <span className='text-green-600 dark:text-green-400 text-sm font-semibold'>
                                Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button
              onClick={handlePrevious}
              variant='outline'
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!selectedOptions[currentQuestion?.id]}
            >
              {currentQuestionIndex === questions.length - 1
                ? 'Finish'
                : 'Next'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Side Timer / Progress Panel */}
      <aside className='w-full lg:w-64 lg:sticky lg:top-8 self-start'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Timer</CardTitle>
            <CardDescription>Quiz progress & time</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='text-center'>
              <div className='text-3xl font-mono font-semibold'>
                {formatTime(elapsedMs)}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>Elapsed</p>
            </div>
            <div>
              <div className='flex justify-between text-xs mb-1'>
                <span>Answered</span>
                <span>
                  {answeredCount}/{questions.length}
                </span>
              </div>
              <div className='h-2 rounded bg-muted overflow-hidden'>
                <div
                  className='h-full bg-primary transition-all'
                  style={{
                    width: `${(answeredCount / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-1'>
              {questions.map((q, idx) => {
                const answered = !!selectedOptions[q.id];
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`text-[10px] aspect-square rounded flex items-center justify-center border transition-colors ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : answered
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    aria-label={`Go to question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className='flex flex-col gap-2'>
              <Button variant='outline' className='w-full' onClick={handleExit}>
                Exit
              </Button>
              <Button
                className='w-full'
                onClick={handleNext}
                disabled={!selectedOptions[currentQuestion?.id]}
              >
                {currentQuestionIndex === questions.length - 1
                  ? 'Finish'
                  : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
