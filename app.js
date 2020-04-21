$(document).ready(
    function(){

        $(".form-group-time-quantum").hide();

        // Show hide RR time quantum
        $('#algorithmSelector').on('change', function(){
            if(this.value === 'optRR') {
                $(".form-group-time-quantum").show(1000);
            } else {
                $(".form-group-time-quantum").hide(1000);
            }
        });


        var processList = [];

        $('#btnAddProcess').on('click', function(){
            var processID = $('#processID');
            var arrivalTime = $('#arrivalTime');
            var burstTime = $('#burstTime');

            if(processID.val() === '' || arrivalTime.val() === '' || burstTime.val() === ''){
                processID.addClass('is-invalid');
                arrivalTime.addClass('is-invalid');
                burstTime.addClass('is-invalid');
                return;
            }

            var process = {
                processID: parseInt(processID.val(), 10),
                arrivalTime: parseInt(arrivalTime.val(), 10),
                burstTime: parseInt(burstTime.val(), 10)
            }

            processList.push(process);
            
            $('#tblProcessList > tbody:last-child').append(
                `<tr>
                    <td id="tdProcessID">${processID.val()}</td>
                    <td id="tdArrivalTime">${arrivalTime.val()}</td>
                    <td id="tdBurstTime">${burstTime.val()}</td>
                </tr>`
            );

            processID.val('');
            arrivalTime.val('');
            burstTime.val('');
        });

        $('#btnCalculate').on('click', function(){
            var selectedAlgo = $('#algorithmSelector').children('option:selected').val();

            if (selectedAlgo === 'optFCFS') {
                firstComeFirstServed();
            }

            if (selectedAlgo === 'optSJF') {
                shortestJobFirst();
            }

            if (selectedAlgo === 'optSRTF') {
                shortestRemainingTimeFirst();
            }

            if (selectedAlgo === 'optRR') {
                roundRobin();
            }
        });

        // Begin First Come First Served
        function firstComeFirstServed(){

            var time = 0;
            var queue = [];
            var completedList = [];

            while (processList.length > 0 || queue.length > 0) {
                while (queue.length == 0) {
                    time++;
                    addToQueue();
                }

                process = queue.shift();
                console.log(process);
                for(var i = 0; i < process.burstTime; i++){
                    time++
                    addToQueue();
                }   
                process.completedTime = time;
                process.turnAroundTime = process.completedTime - process.arrivalTime;
                process.waitingTime = process.turnAroundTime - process.burstTime;
                completedList.push(process);
            }

            function addToQueue() {
                for(var i = 0; i < processList.length; i++) {
                    if(time >= processList[i].arrivalTime) {
                        let process = {
                            processID: processList[i].processID, 
                            arrivalTime: processList[i].arrivalTime, 
                            burstTime: processList[i].burstTime
                        }
                        processList.splice(i, 1);
                        queue.push(process);
                    }
                }
            }

            $.each(completedList, function(key, process){
                $('#tblResults > tbody:last-child').append(
                    `<tr>
                        <td id="tdProcessID">${process.processID}</td>
                        <td id="tdArrivalTime">${process.arrivalTime}</td>
                        <td id="tdBurstTime">${process.burstTime}</td>
                        <td id="tdBurstTime">${process.completedTime}</td>
                        <td id="tdBurstTime">${process.waitingTime}</td>
                        <td id="tdBurstTime">${process.turnAroundTime}</td>
                    </tr>`
                );
            });

            // Get average
            var avgTurnaroundTime = 0;
            var avgWaitingTime = 0;
            var maxCompletedTime = 0;

            $.each(completedList, function(key, process){
                if (process.completedTime > maxCompletedTime) {
                    maxCompletedTime = process.completedTime;
                }
                avgTurnaroundTime = avgTurnaroundTime + process.turnAroundTime;
                avgWaitingTime = avgWaitingTime + process.waitingTime;
            });

            $('#avgTurnaroundTime').val( avgTurnaroundTime / completedList.length );
            $('#avgWaitingTime').val( avgWaitingTime / completedList.length );
            $('#throughput').val(completedList.length / maxCompletedTime);
        }

        function shortestJobFirst(){
            let completedList = [];
            let time = 0;
            let queue = [];

            while (processList.length>0 || queue.length>0) {
                console.log("in 1st while");
                getProcessToQueue();
                while (queue.length==0) {   
                    console.log("in 2 while");             
                    time=time+1;
                    getProcessToQueue();
                }
                processToRun = selectProcess();
                console.log(processToRun);
                for (let i = 0; i < processToRun.burstTime; i++) {
                    time=time+1;
                    getProcessToQueue();
                }
                console.log(processToRun);
                processToRun.processID = processToRun.processID;
                processToRun.arrivalTime = processToRun.arrivalTime;
                processToRun.burstTime = processToRun.burstTime;
                processToRun.completedTime = time;
                processToRun.turnAroundTime = processToRun.completedTime - processToRun.arrivalTime;
                processToRun.waitingTime = processToRun.turnAroundTime - processToRun.burstTime;
                console.log(processToRun);
                completedList.push(processToRun);
                

            }
            $.each(completedList, function(key, process){
                $('#tblResults > tbody:last-child').append(
                    `<tr>
                        <td id="tdProcessID">${process.processID}</td>
                        <td id="tdArrivalTime">${process.arrivalTime}</td>
                        <td id="tdBurstTime">${process.burstTime}</td>
                        <td id="tdBurstTime">${process.completedTime}</td>
                        <td id="tdBurstTime">${process.waitingTime}</td>
                        <td id="tdBurstTime">${process.turnAroundTime}</td>
                    </tr>`
                );
            });
            function getProcessToQueue() {
                console.log("in add to q");
                for(var i = processList.length - 1; i >= 0; i--) {
                    if(processList[i].arrivalTime === time) {
                        console.log(processList[i])
                        let p = {processID: processList[i].processID, arrivalTime: processList[i].arrivalTime, burstTime: processList[i].burstTime}
                        processList.splice(i, 1);
                        queue.push(p);
                        console.log(queue);
                    }
                }
            }
            function selectProcess() {
                console.log("select best");
                console.log(queue);
                if (queue.length!=0) {
                    console.log("select best not null q");
                    queue.sort(function(a, b){
                            if (a.burstTime > b.burstTime) {
                                return 1;
                        } else {
                            return -1;
                        }
                    });
                }

                let process = queue[0];
                queue.splice(0, 1);
                

                console.log(queue);
                console.log(process);
                return process;
            }

            // Get average
            var avgTurnaroundTime = 0;
            var avgWaitingTime = 0;
            var maxCompletedTime = 0;
            var throughput = 0;

            $.each(completedList, function(key, process){
                if (process.completedTime > maxCompletedTime) {
                    maxCompletedTime = process.completedTime;
                }
                avgTurnaroundTime = avgTurnaroundTime + process.turnAroundTime;
                avgWaitingTime = avgWaitingTime + process.waitingTime;
            });

            $('#avgTurnaroundTime').val( avgTurnaroundTime / completedList.length );
            $('#avgWaitingTime').val( avgWaitingTime / completedList.length );
            $('#throughput').val(completedList.length / maxCompletedTime);
        }

        function shortestRemainingTimeFirst() {
            let completedList = [];
            let time = 0;
            let queue = [];
            
            while ( processList.length>0 || queue.length>0 ) {
                getProcessToQueue();
                while (queue.length==0) {   
                    console.log("in 2 while");             
                    time=time+1;
                    getProcessToQueue();
                }
             process = selectProcessForSRTF();
             runSRTF(process);
            }
            
            var TableData = new Array();
            $('#tblProcessList tr').each(function(row, tr) {
              TableData[row] = {
                "processID": parseInt($(tr).find('td:eq(0)').text()),
                "arrivalTime": parseInt($(tr).find('td:eq(1)').text()),
                "burstTime": parseInt($(tr).find('td:eq(2)').text())
              }
            });

            TableData.splice(0, 1);
            
            TableData.forEach(pInTable => {
                completedList.forEach(pInCompleted => {
                    if (pInTable.processID==pInCompleted.processID) {
                        pInCompleted.burstTime= pInTable.burstTime;
                        pInCompleted.turnAroundTime = pInCompleted.completedTime - pInCompleted.arrivalTime;
                        pInCompleted.waitingTime = pInCompleted.turnAroundTime - pInCompleted.burstTime;
                    }
                });
            });
            console.log('Table data begin');
            console.log(TableData);
            console.log('Table data end');
            $.each(completedList, function(key, process){
                $('#tblResults > tbody:last-child').append(
                    `<tr>
                        <td id="tdProcessID">${process.processID}</td>
                        <td id="tdArrivalTime">${process.arrivalTime}</td>
                        <td id="tdBurstTime">${process.burstTime}</td>
                        <td id="tdBurstTime">${process.completedTime}</td>
                        <td id="tdBurstTime">${process.waitingTime}</td>
                        <td id="tdBurstTime">${process.turnAroundTime}</td>
                    </tr>`
                );
            });
            function getProcessToQueue() {

                for(var i = processList.length - 1; i >= 0; i--) {
                    if(processList[i].arrivalTime === time) {
                        console.log(processList[i])
                        let p = {processID: processList[i].processID, arrivalTime: processList[i].arrivalTime, burstTime: processList[i].burstTime}
                        processList.splice(i, 1);
                        queue.push(p);
                        console.log(queue);
                    }
                }
            }
            function selectProcessForSRTF() {
                console.log(queue);
                
                if (queue.length!=0) {
                    console.log("select best not null q");
                    queue.sort(function(a, b){
                        if (a.burstTime > b.burstTime) {
                                return 1;
                        } else {
                            return -1;
                        }
                    });
                    console.log(queue);
                    if (queue[0].burstTime==1) {
                        process = queue[0];
                        queue.splice(0, 1);
                        // process=queue.pop();
                        process.completedTime=time+1;
                        completedList.push(process);

                    } else if(queue[0].burstTime>1){
                        process=queue[0];
                        queue[0].burstTime=process.burstTime-1;
                    }   
                    return process;
                }

                return null;
            }
            function runSRTF(process) {
                time=time+1;
                getProcessToQueue();
            }

            // Get average
            var avgTurnaroundTime = 0;
            var avgWaitingTime = 0;
            var maxCompletedTime = 0;
            var throughput = 0;

            $.each(completedList, function(key, process){
                if (process.completedTime > maxCompletedTime) {
                    maxCompletedTime = process.completedTime;
                }
                avgTurnaroundTime = avgTurnaroundTime + process.turnAroundTime;
                avgWaitingTime = avgWaitingTime + process.waitingTime;
            });

            $('#avgTurnaroundTime').val( avgTurnaroundTime / completedList.length );
            $('#avgWaitingTime').val( avgWaitingTime / completedList.length );
            $('#throughput').val(completedList.length / maxCompletedTime);
        }

        function roundRobin() {
            let timeQuantum = $('#timeQuantum');
            let timeQuantumVal= parseInt(timeQuantum.val(), 10);
            if(timeQuantum.val() ==''){
                timeQuantum.addClass('is-invalid');
                return;
            }
            let completedList = [];
            let time = 0;
            let queue = [];
            
            while (processList.length>0 || queue.length>0) {
                getProcessToQueue();
                while (queue.length==0) {               
                    time=time+1;
                    getProcessToQueue();
                }
                    selectProcessForRR();
            }
            var TableData = new Array();
            $('#tblProcessList tr').each(function(row, tr) {
                TableData[row] = {
                    "processID": parseInt($(tr).find('td:eq(0)').text()),
                    "arrivalTime": parseInt($(tr).find('td:eq(1)').text()),
                    "burstTime": parseInt($(tr).find('td:eq(2)').text())
                }
            });
            TableData.splice(0, 1);
                
            TableData.forEach(pInTable => {
                completedList.forEach(pInCompleted => {
                    if (pInTable.processID==pInCompleted.processID) {
                        pInCompleted.burstTime= pInTable.burstTime;
                        pInCompleted.turnAroundTime = pInCompleted.completedTime - pInCompleted.arrivalTime;
                        pInCompleted.waitingTime = pInCompleted.turnAroundTime - pInCompleted.burstTime;
                    }
                });
            });

            console.log(TableData);

            $.each(completedList, function(key, process){
                $('#tblResults > tbody:last-child').append(
                    `<tr>
                        <td id="tdProcessID">${process.processID}</td>
                        <td id="tdArrivalTime">${process.arrivalTime}</td>
                        <td id="tdBurstTime">${process.burstTime}</td>
                        <td id="tdBurstTime">${process.completedTime}</td>
                        <td id="tdBurstTime">${process.waitingTime}</td>
                        <td id="tdBurstTime">${process.turnAroundTime}</td>
                    </tr>`
                );
            });
            function getProcessToQueue() {
                console.log("in add to q");
                for(var i = processList.length - 1; i >= 0; i--) {
                    if(processList[i].arrivalTime === time) {
                        console.log(processList[i])
                        let p = {processID: processList[i].processID, arrivalTime: processList[i].arrivalTime, burstTime: processList[i].burstTime}
                        processList.splice(i, 1);
                        queue.push(p);
                        console.log(queue);
                    }
                }
            }
            function selectProcessForRR() {
                if (queue.length!=0) {
                    queue.sort(function(a, b){
                        if (a.burstTime > b.burstTime) {
                            return 1;
                        } else {
                            return -1;
                        }
                    });

                    console.log("sorted");
                    console.log(queue[0].burstTime);
                    console.log(timeQuantumVal);
                    console.log("time"+time);
                                                
                    if (queue[0].burstTime < timeQuantumVal) {
                        console.log("less");
                        process = queue[0];
                        queue.splice(0, 1);
                        process.completedTime=time+process.burstTime;
                            
                        for (let index = 0; index < process.burstTime; index++) {
                            time=time+1;
                            getProcessToQueue();
                            console.log("run");
                                
                        }
                        completedList.push(process);

                    }
                        else if(queue[0].burstTime==timeQuantumVal){
                            console.log("same");
                            process = queue[0];
                            queue.splice(0, 1);
                            process.completedTime=time+timeQuantumVal;
                            completedList.push(process);

                            for (let index = 0; index < timeQuantumVal; index++) {
                                time=time+1;
                                getProcessToQueue();
                                console.log("run");
                                
                            }
                        }  
                        else if(queue[0].burstTime>timeQuantumVal){
                            console.log("more");
                            process=queue[0];
                            queue[0].burstTime=process.burstTime-timeQuantumVal;

                            for (let index = 0; index < timeQuantumVal; index++) {
                                time=time+1;
                                getProcessToQueue();
                                console.log("run");
                                
                            }
                        }   
                    }
                }
                // Get average
                var totalTurnaroundTime = 0;
                var totalWaitingTime = 0;
                var maxCompletedTime = 0;

                $.each(completedList, function(key, process){
                    if (process.completedTime > maxCompletedTime) {
                        maxCompletedTime = process.completedTime;
                    }
                    totalTurnaroundTime = totalTurnaroundTime + process.turnAroundTime;
                    totalWaitingTime = totalWaitingTime + process.waitingTime;
                });

                console.log(maxCompletedTime);

                $('#avgTurnaroundTime').val( totalTurnaroundTime / completedList.length );
                $('#avgWaitingTime').val( totalWaitingTime / completedList.length );
                $('#throughput').val(completedList.length / maxCompletedTime);
            
        }
            
    }
);