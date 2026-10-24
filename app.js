const cl = console.log;

const stdform = document.getElementById('stdform')
const lname = document.getElementById('lname')
const fname = document.getElementById('fname')
const email = document.getElementById('email')
const contact = document.getElementById('contact')
const addbtn = document.getElementById('addbtn')
const updatebtn = document.getElementById('updatebtn')
const tableInfo = document.getElementById('tableInfo')
const spinner = document.getElementById('spinner')


const Base_Url = `https://crud-dfd04-default-rtdb.firebaseio.com/`
const student_Url = `${Base_Url}student.json`

const state = {
    studentArr : [],
    edit_Id : null,
}

function objToArr(obj){
    for(const key in obj){
        obj[key].id = key;
        state.studentArr.unshift(obj[key])
    }
}

function handleSpinner(flag){
    if(flag){
        spinner.classList.remove('d-none')
    }else{
        spinner.classList.add('d-none')
    }
}

function snackBar(msg,icon){
    Swal.fire({
        title:msg,
        timer:3000,
        icon:icon,
    })
}

async function oncreate(){
    handleSpinner(true)
    try{
        let res = await fetch(student_Url)
        if(!res.ok){
            throw new Error('error')
        }
        let data = await res.json();
        state.studentArr = [];
        objToArr(data)
        templiting(state.studentArr);
    }catch(err){
       snackBar(err.message,'error');
    }
    finally{
        handleSpinner()
    }
}
oncreate();

//templiting

function templiting(arr){
    let result =``;
    arr.forEach((s,i)=>{
        result += `
                <tr id="${s.id}">
                <td>${i+1}</td>
                <td>${s.fname}</td>
                <td>${s.lname}</td>
                <td>${s.email}</td>
                <td>${s.contact}</td>
                <td><button onclick="onedit(this)" class="btn btn-sm btn-primary">Edit</button></td>
                <td><button onclick="ondelete(this)" class="btn btn-sm btn-danger">Delete</button></td>
                </tr> `
    })
    tableInfo.innerHTML = result;
}


//create

async function onAddstd(eve){
    eve.preventDefault();
    try{
        handleSpinner(true);
        let newObj = {
         fname:fname.value,
         lname:lname.value,
         email:email.value,
         contact:contact.value
        }
        
        let res = await fetch(student_Url,{
            method:"POST",
            body:JSON.stringify(newObj),
            headers :{
                "Content-Type":"Application/json",
            }
        })
        
        if(!res.ok){
          throw new Error("Error:"+res.status)            
        }
        let data = await res.json()
        newObj.id = data.name;
        state.studentArr.unshift(newObj)
        templiting(state.studentArr)
        
        stdform.reset();
        snackBar("Student Data Added Successfully !!",'success')
    }catch(err){
         snackBar(err.message,'error')
    }
    finally{
        handleSpinner()
    }
}

//delete

async function ondelete(ele){
    let remove_Id = ele.closest('tr').id
    let remove_url = `${Base_Url}student/${remove_Id}.json`;
 
  let getconfirm = await Swal.fire({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "Yes, delete it!"
})
if(getconfirm.isConfirmed){
    try{
        handleSpinner(true)
        let res = await fetch(remove_url,{
            method : "DELETE",
        })
        if(!res.ok){
            throw new  Error("Error" + res.status)
        }
        let getIndex = state.studentArr.findIndex(t => t.id === remove_Id);
        state.studentArr.splice(getIndex,1)
        ele.closest('tr').remove()

        let td = [...document.querySelectorAll("#tableInfo tr td:first-child")];
                       td.forEach((td,i)=>{
                        td.innerHTML = i+1
                       })
                       
        snackBar("Data Deleted successfully!",'success')
    }catch (err){
       snackBar(err.message,'error')
    }
    finally{
        handleSpinner()
    }
}
}

//edit

function onedit(ele) {
    let EDIT_ID = ele.closest('tr').id;
    state.edit_Id = EDIT_ID;
    let EDIT_OBJ = state.studentArr.find(t => t.id === EDIT_ID);

    fname.value = EDIT_OBJ.fname;
    lname.value = EDIT_OBJ.lname;
    email.value = EDIT_OBJ.email;
    contact.value = EDIT_OBJ.contact;

    addbtn.classList.add('d-none');
    updatebtn.classList.remove('d-none');
}


async function onupdate() {
    try {
        handleSpinner(true);
        let update_id = state.edit_Id;
        let update_url = `${Base_Url}student/${update_id}.json`;
        let updated_obj = {
            fname:fname.value,
            lname:lname.value,
            email:email.value,
            contact:contact.value,
            id: update_id,
        }
        let res = await fetch(update_url, {
            method: "PATCH",
            body: JSON.stringify(updated_obj),
            headers: {
                "content-Type": "Application/json",
            }
        })
        if (!res.ok) {
            throw new Error("Update failed: " + res.status);
        }
        let data = await res.json();
        let getIndex = state.studentArr.findIndex(t => t.id === update_id);
        state.studentArr[getIndex] = updated_obj;
       templiting(state.studentArr)
        stdform.reset();
        state.edit_Id = null;
        snackBar("Data updated successfully", 'success');

        updatebtn.classList.add('d-none');
        addbtn.classList.remove('d-none');

    }
    catch (err) {
        snackBar(err.message, 'error');
    }
    finally {
        handleSpinner();
    }

}


updatebtn.addEventListener("click",onupdate)
stdform.addEventListener("submit",onAddstd)