import React, { useState, useCallback, useMemo } from 'react';
import { Upload, Search, FileText, AlertTriangle, CheckCircle, XCircle, Sun, Moon, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import DateTimeRangePicker from './DateTimeRangePicker';
import { 
  extractTimestampFromLine, 
  analyzeFileTimestamps, 
  isTimestampInRange, 
  FileTimestampMetadata 
} from '@/utils/dateTimeParser';

interface LogEntry {
  line: string;
  lineNumber: number;
  type: 'error' | 'warning' | 'success' | 'info';
  timestamp?: Date | null;
  originalTimestamp?: string;
}

interface LogFile {
  id: string;
  name: string;
  content: string;
  entries: LogEntry[];
  errors: number;
  warnings: number;
  success: number;
  timestampMetadata: FileTimestampMetadata;
}

interface DashboardStats {
  totalFiles: number;
  filesWithErrors: number;
  filesWithWarnings: number;
  filesWithSuccess: number;
  totalErrors: number;
  totalWarnings: number;
  totalSuccess: number;
  totalTimestamps: number;
  dateRange: {
    earliest: Date | null;
    latest: Date | null;
  };
}

const LogAnalyzer = () => {
  const [files, setFiles] = useState<LogFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'error' | 'warning' | 'success'>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [startDateTime, setStartDateTime] = useState<Date | null>(null);
  const [endDateTime, setEndDateTime] = useState<Date | null>(null);

  const analyzeLogContent = (content: string, fileName: string): LogFile => {
    const lines = content.split('\n');
    const entries: LogEntry[] = [];
    let errors = 0, warnings = 0, success = 0;

    lines.forEach((line, index) => {
      if (line.trim()) {
        const lowerLine = line.toLowerCase();
        let type: LogEntry['type'] = 'info';
        
        // Extract timestamp from line
        const timestampData = extractTimestampFromLine(line);
        
        // ERROR: includes CRITICAL, FATAL, and ERROR
        if (lowerLine.includes('critical') || lowerLine.includes('fatal') || lowerLine.includes('error')) {
          type = 'error';
          errors++;
        }
        // WARNING: includes WARNING and NOTICE
        else if (lowerLine.includes('warning') || lowerLine.includes('notice')) {
          type = 'warning';
          warnings++;
        }
        // SUCCESS: includes INFO, DEBUG, and SUCCESS
        else if (lowerLine.includes('info') || lowerLine.includes('debug') || lowerLine.includes('success')) {
          type = 'success';
          success++;
        }

        entries.push({
          line: line.trim(),
          lineNumber: index + 1,
          type,
          timestamp: timestampData?.parsed || null,
          originalTimestamp: timestampData?.original
        });
      }
    });

    const fileId = Date.now().toString() + Math.random().toString(36);
    const timestampMetadata = analyzeFileTimestamps(content, fileName, fileId);

    return {
      id: fileId,
      name: fileName,
      content,
      entries,
      errors,
      warnings,
      success,
      timestampMetadata
    };
  };

  const handleFileUpload = useCallback((uploadedFiles: FileList) => {
    Array.from(uploadedFiles).forEach(file => {
      if (file.type === 'text/plain' || file.name.endsWith('.log') || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const analyzedFile = analyzeLogContent(content, file.name);
          setFiles(prev => [...prev, analyzedFile]);
        };
        reader.readAsText(file);
      }
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const dashboardStats: DashboardStats = useMemo(() => {
    const stats = {
      totalFiles: files.length,
      filesWithErrors: files.filter(f => f.errors > 0).length,
      filesWithWarnings: files.filter(f => f.warnings > 0).length,
      filesWithSuccess: files.filter(f => f.success > 0).length,
      totalErrors: files.reduce((sum, f) => sum + f.errors, 0),
      totalWarnings: files.reduce((sum, f) => sum + f.warnings, 0),
      totalSuccess: files.reduce((sum, f) => sum + f.success, 0),
      totalTimestamps: files.reduce((sum, f) => sum + f.timestampMetadata.totalTimestamps, 0),
      dateRange: {
        earliest: null as Date | null,
        latest: null as Date | null
      }
    };

    // Calculate overall date range
    files.forEach(file => {
      if (file.timestampMetadata.earliest) {
        if (!stats.dateRange.earliest || file.timestampMetadata.earliest < stats.dateRange.earliest) {
          stats.dateRange.earliest = file.timestampMetadata.earliest;
        }
      }
      if (file.timestampMetadata.latest) {
        if (!stats.dateRange.latest || file.timestampMetadata.latest > stats.dateRange.latest) {
          stats.dateRange.latest = file.timestampMetadata.latest;
        }
      }
    });

    return stats;
  }, [files]);

  const filteredFiles = useMemo(() => {
    let filtered = files;

    // Apply datetime filter first
    if (startDateTime || endDateTime) {
      filtered = filtered.map(file => {
        const filteredEntries = file.entries.filter(entry => {
          if (!entry.timestamp) return false;
          return isTimestampInRange(entry.timestamp, startDateTime, endDateTime);
        });

        // Only include files that have matching entries
        if (filteredEntries.length === 0) return null;

        return {
          ...file,
          entries: filteredEntries
        };
      }).filter(Boolean) as LogFile[];
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(file => {
        switch (selectedFilter) {
          case 'error': return file.errors > 0;
          case 'warning': return file.warnings > 0;
          case 'success': return file.success > 0;
          default: return true;
        }
      });
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.entries.some(entry => 
          entry.line.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    return filtered;
  }, [files, selectedFilter, searchQuery, startDateTime, endDateTime]);

  const toggleFileExpansion = (fileId: string) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const getEntryIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  const highlightSearchTerm = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{part}</span> : 
        part
    );
  };

  const clearDateTimeFilter = () => {
    setStartDateTime(null);
    setEndDateTime(null);
  };

  return (
    <TooltipProvider>
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Header - Centered */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex-1"></div>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Log Analyzer
              </h1>
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={() => setIsDarkMode(!isDarkMode)}
                variant="outline"
                size="sm"
                className="transition-all duration-200"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* File Upload Area */}
          {files.length === 0 && (
            <Card className="mb-8 border-2 border-dashed border-blue-300 hover:border-blue-400 transition-colors duration-200">
              <CardContent 
                className="p-12 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors duration-200"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Drop your log files here
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Supports .log and .txt files. Drop multiple files at once.
                </p>
                <input
                  type="file"
                  multiple
                  accept=".log,.txt,text/plain"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </label>
              </CardContent>
            </Card>
          )}

          {files.length > 0 && (
            <>
              {/* Dashboard Stats with Tooltips */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Files</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalFiles}</p>
                        {dashboardStats.totalTimestamps > 0 && (
                          <p className="text-xs text-gray-500">{dashboardStats.totalTimestamps} timestamps</p>
                        )}
                      </div>
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card 
                      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                      onClick={() => setSelectedFilter(selectedFilter === 'error' ? 'all' : 'error')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ERROR</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">includes CRITICAL, FATAL</p>
                            <p className="text-2xl font-bold text-red-600">{dashboardStats.totalErrors}</p>
                            <p className="text-xs text-gray-500">{dashboardStats.filesWithErrors} files</p>
                          </div>
                          <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Includes: CRITICAL, FATAL, ERROR</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card 
                      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                      onClick={() => setSelectedFilter(selectedFilter === 'warning' ? 'all' : 'warning')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">WARNING</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">includes NOTICE</p>
                            <p className="text-2xl font-bold text-yellow-600">{dashboardStats.totalWarnings}</p>
                            <p className="text-xs text-gray-500">{dashboardStats.filesWithWarnings} files</p>
                          </div>
                          <AlertTriangle className="w-8 h-8 text-yellow-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Includes: WARNING, NOTICE</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card 
                      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                      onClick={() => setSelectedFilter(selectedFilter === 'success' ? 'all' : 'success')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SUCCESS</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">includes INFO, DEBUG</p>
                            <p className="text-2xl font-bold text-green-600">{dashboardStats.totalSuccess}</p>
                            <p className="text-xs text-gray-500">{dashboardStats.filesWithSuccess} files</p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Includes: INFO, DEBUG, SUCCESS</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* DateTime Range Filter */}
              <div className="mb-6">
                <DateTimeRangePicker
                  startDateTime={startDateTime}
                  endDateTime={endDateTime}
                  onStartDateTimeChange={setStartDateTime}
                  onEndDateTimeChange={setEndDateTime}
                  onClear={clearDateTimeFilter}
                />
              </div>

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search across all files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedFilter('all')}
                    size="sm"
                  >
                    All
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedFilter === 'error' ? 'default' : 'outline'}
                        onClick={() => setSelectedFilter('error')}
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Errors
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>CRITICAL, FATAL, ERROR</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedFilter === 'warning' ? 'default' : 'outline'}
                        onClick={() => setSelectedFilter('warning')}
                        size="sm"
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Warnings
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>WARNING, NOTICE</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedFilter === 'success' ? 'default' : 'outline'}
                        onClick={() => setSelectedFilter('success')}
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Success
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>INFO, DEBUG, SUCCESS</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Add More Files Button */}
              <div className="mb-6">
                <input
                  type="file"
                  multiple
                  accept=".log,.txt,text/plain"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  id="add-more-files"
                />
                <label htmlFor="add-more-files">
                  <Button variant="outline" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Add More Files
                  </Button>
                </label>
              </div>

              {/* Log Files Display */}
              <div className="space-y-6">
                {filteredFiles.map((file) => (
                  <Card key={file.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {file.name}
                          </CardTitle>
                          <div className="flex gap-2 flex-wrap">
                            {file.errors > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {file.errors} Errors
                              </Badge>
                            )}
                            {file.warnings > 0 && (
                              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-xs">
                                {file.warnings} Warnings
                              </Badge>
                            )}
                            {file.success > 0 && (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                                {file.success} Success/Info
                              </Badge>
                            )}
                            {file.timestampMetadata.totalTimestamps > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {file.timestampMetadata.totalTimestamps} timestamps
                              </Badge>
                            )}
                            {file.timestampMetadata.earliest && file.timestampMetadata.latest && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Time range: {file.timestampMetadata.earliest.toLocaleString()} - {file.timestampMetadata.latest.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFileExpansion(file.id)}
                        >
                          {expandedFiles.has(file.id) ? 'Collapse' : 'Expand'}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    {expandedFiles.has(file.id) && (
                      <CardContent className="pt-0">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                          <div className="space-y-2">
                            {file.entries
                              .filter(entry => {
                                if (selectedFilter === 'all') return true;
                                return entry.type === selectedFilter;
                              })
                              .filter(entry => {
                                if (!searchQuery) return true;
                                return entry.line.toLowerCase().includes(searchQuery.toLowerCase());
                              })
                              .map((entry, index) => (
                                <div key={index} className="flex items-start gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                                  {getEntryIcon(entry.type)}
                                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono min-w-[3rem]">
                                    {entry.lineNumber}:
                                  </span>
                                  {entry.originalTimestamp && (
                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-mono min-w-[8rem] flex-shrink-0">
                                      {entry.originalTimestamp}
                                    </span>
                                  )}
                                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300 flex-1">
                                    {highlightSearchTerm(entry.line, searchQuery)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              {filteredFiles.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No files match your current filters
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Try adjusting your search query, category filter, or datetime range.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LogAnalyzer;
