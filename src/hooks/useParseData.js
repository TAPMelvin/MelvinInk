import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for fetching data from Parse models
 * @param {Function} fetchFunction - Parse model function to fetch data
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useParseData = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

/**
 * Custom hook for managing Parse object state
 * @param {Object} initialData - Initial data for the object
 * @returns {Object} - { data, setData, loading, error, save, update, delete }
 */
export const useParseObject = (initialData = {}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const save = useCallback(async (saveFunction) => {
    try {
      setLoading(true);
      setError(null);
      const result = await saveFunction(data);
      setData(result);
      return result;
    } catch (err) {
      console.error('Error saving data:', err);
      setError(err.message || 'An error occurred while saving data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [data]);

  const update = useCallback(async (updateFunction) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateFunction();
      setData(result);
      return result;
    } catch (err) {
      console.error('Error updating data:', err);
      setError(err.message || 'An error occurred while updating data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteObject = useCallback(async (deleteFunction) => {
    try {
      setLoading(true);
      setError(null);
      await deleteFunction();
      setData(null);
    } catch (err) {
      console.error('Error deleting data:', err);
      setError(err.message || 'An error occurred while deleting data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    setData,
    loading,
    error,
    save,
    update,
    deleteObject
  };
};

/**
 * Custom hook for handling form submissions with Parse
 * @param {Function} submitFunction - Function to handle form submission
 * @returns {Object} - { submit, loading, error, success }
 */
export const useParseForm = (submitFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const result = await submitFunction(formData);
      setSuccess(true);
      return result;
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'An error occurred while submitting the form');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [submitFunction]);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    submit,
    loading,
    error,
    success,
    reset
  };
};
