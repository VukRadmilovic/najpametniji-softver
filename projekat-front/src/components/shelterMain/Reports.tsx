import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {Button, InputLabel, MenuItem, Select} from "@mui/material";
import {useEffect, useState} from "react";
import {ShelterService} from "../../services/ShelterService";
import {Report} from "../../models/Report";

const weeksInMonth = (year, month) => {
    const startOfMonth = dayjs(new Date(year, month, 1));
    const endOfMonth = dayjs(new Date(year, month + 1, 0));
    const weeks = [];
    let current = startOfMonth;

    while (current.isBefore(endOfMonth) || current.isSame(endOfMonth, 'day')) {
        const startOfWeek = current;
        const endOfWeek = current.add(6, 'day').isAfter(endOfMonth) ? endOfMonth : current.add(6, 'day');
        weeks.push({
            start: startOfWeek,
            end: endOfWeek,
        });
        current = current.add(7, 'day').startOf('day');
    }

    return weeks;
};

const WeekPicker = ({weekSelected, setWeekSelected, monthYear, setMonthYear}) => {
    const [weeks, setWeeks] = useState([]);
    // const [monthYear, setMonthYear] = React.useState<Dayjs | null>(dayjs('2023-06-12'))
    const [selectedDate, setSelectedDate] = React.useState({ start: dayjs(), end: dayjs() });
    // const [weekSelected, setWeekSelected] = React.useState({ start: dayjs(), end: dayjs() });

    useEffect(() => {
        const date = monthYear;
        const year = date.year();
        const month = date.month();
        setWeeks(weeksInMonth(year, month));
    }, [monthYear]);

    const handleWeekChange = (event) => {
        const week = weeks[event.target.value];
        setSelectedDate({ start: week.start, end: week.end });
        setWeekSelected(week);
    };

    return (
        <FormControl fullWidth>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="Pick month for report"
                    value={monthYear}
                    onChange={(newDate) => setMonthYear(newDate)}
                    views={['month', 'year']}
                />
            </LocalizationProvider>
            <br/>
            <InputLabel id="week-label" sx={{marginTop: 10}}>Pick week for report</InputLabel>
            <Select
                labelId="week-label"
                id="week-select"
                label="Pick week for report"
                value={weeks.findIndex(week => week.start.isSame(selectedDate.start) && week.end.isSame(selectedDate.end))}
                onChange={handleWeekChange}
            >
                {weeks.map((week, index) => (
                    <MenuItem key={index} value={index}>
                        {`${week.start.format('DD.MM.YYYY')} - ${week.end.format('DD.MM.YYYY')}`}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

interface ReportProps {
    shelterService: ShelterService;
}

export function Reports({shelterService}: ReportProps) {
    const [reportType, setReportType] = React.useState('daily');
    const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(dayjs('2024-06-12'));
    const [weekSelected, setWeekSelected] = React.useState({ start: dayjs(), end: dayjs() });
    const [monthYear, setMonthYear] = React.useState<Dayjs | null>(dayjs('2024-06-12'));
    const [reportData, setReportData] = React.useState({ adoptionCount: -1, shelteredCount: -1});

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setReportType((event.target as HTMLInputElement).value);
    };

    function generateReport() {
        console.log("Generating report for", reportType, selectedDate?.toDate());

        if (reportType === 'daily') {
            const data = selectedDate?.format('D.M.YYYY.');
            console.log("Day selected", data);
            shelterService.getDailyReport(data).then((response: Report) => {
                console.log(response);
                setReportData(response);
            }).catch((error) => {
                console.error(error);
            });
        }

        if (reportType === 'weekly') {
            const data = weekSelected?.start.format('D.M.YYYY.') + ' - ' + weekSelected?.end.format('D.M.YYYY.');
            console.log("Week selected", data);
            shelterService.getWeeklyReport(data).then((response: Report) => {
                console.log(response);
                setReportData(response);
            }).catch((error) => {
                console.error(error);
            });
        }

        if (reportType === 'monthly') {
            const data = selectedDate?.format('M.YYYY.');
            console.log("Month selected", data);
            shelterService.getMonthlyReport(data).then((response: Report) => {
                console.log(response);
                setReportData(response);
            }).catch((error) => {
                console.error(error);
            });
        }
    }

    return (
        <FormControl>
            <FormLabel id="report-type">Report type</FormLabel>
            <RadioGroup
                row
                aria-labelledby="report-type"
                name="report-type-group"
                value={reportType}
                onChange={handleChange}
            >
                <FormControlLabel value="daily" control={<Radio />} label="Daily" />
                <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
                <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
            </RadioGroup>
            <br/>
            {reportType == 'daily' &&
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Pick date for report"
                        value={selectedDate}
                        onChange={(newDate) => setSelectedDate(newDate)}
                        format={'DD.MM.YYYY'}
                    />
                </LocalizationProvider>}
            {reportType === 'weekly' && (
                <WeekPicker
                    weekSelected={weekSelected}
                    setWeekSelected={setWeekSelected}
                    monthYear={monthYear}
                    setMonthYear={setMonthYear}
                />
            )}
            {reportType == 'monthly' &&
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Pick month for report"
                        value={selectedDate}
                        onChange={(newDate) => setSelectedDate(newDate)}
                        views={['month', 'year']}
                    />
                </LocalizationProvider>}
            <br/>
            <Button type="submit" variant="contained" color="primary" onClick={generateReport}>
                Generate report
            </Button>
            <p>Report: {reportData.adoptionCount} adoptions, {reportData.shelteredCount} shelterings </p>
        </FormControl>
    );
}