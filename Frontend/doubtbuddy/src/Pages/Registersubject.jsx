import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

const SubjectRegister = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      school: '',
      class: '',
      subjects: [{ name: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subjects',
  });

  const onSubmit = async (data) => {
    console.log(data);
    // Convert subjects from [{ name: 'math' }, { name: 'science' }] to ['math', 'science']
    const formattedData = {
      school: data.school,
      Class: data.class,
      subjects: data.subjects.map(subject => subject.name.trim()).filter(name => name),
    };

     console.log(formattedData)
    try {
      const response = await fetch(`http://localhost:${import.meta.env.VITE_PORT}/api/v1/classinfo/add-class`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();
      console.log('Success:', result);
      alert('Subjects registered successfully!');
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to register subjects.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Subject Registration</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium">School</label>
          <input
            {...register('school', { required: 'School is required' })}
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter school name"
          />
          {errors.school && <p className="text-red-500">{errors.school.message}</p>}
        </div>

        <div>
          <label className="block font-medium">Class</label>
          <input
            {...register('class', { required: 'Class is required' })}
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter class"
          />
          {errors.class && <p className="text-red-500">{errors.class.message}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">Subjects</label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`subjects.${index}.name`, { required: 'Subject name is required' })}
                className="flex-grow border px-3 py-2 rounded"
                placeholder={`Subject ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="bg-red-500 text-white px-3 rounded"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ name: '' })}
            className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
          >
            + Add Subject
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded font-semibold"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default SubjectRegister;
