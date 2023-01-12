export function convertDate(name: string){

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                      ];
            const d = new Date(name);
            var month = d.getMonth() + 1;
            var day = d.getDate();
            var year = d.getFullYear();

    return ('0'+day).slice(-2)+' of '+monthNames[month-1]+ ' '+year.toString().slice(-2)
}