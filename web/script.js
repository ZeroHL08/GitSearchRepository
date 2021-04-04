function Autocomplete()
{
    var textInputElement = document.getElementById("easySearchText");
    var currentFocus;

    textInputElement.addEventListener("input", function(e)
    {
        //close the list if already open
        CloseAllLists();
        ClearResults();

        var value = this.value;
        if (!value)
        {
            return false;
        }

        currentFocus = 0;

        //create div element to contain the list items based on values
        var a = document.createElement("DIV");
        a.setAttribute("id", "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);

        if (value.length < 3)
        {
            var b = document.createElement("DIV");
            b.innerHTML = "<p>&lt; Type at least 3 characters &gt;<p>";
            a.appendChild(b);
            return;
        }

        $.ajax
        (
            {
                url:"http://127.0.0.1:8081/searchUsers",
                type: "GET",
                dataType: 'json',
                data:
                {
                    user: document.getElementById('easySearchText').value,
                },
                success: function(result)
                {
                    console.log("search success");
                },
                error: function(result)
                {
                    console.log("search error");
                }
            }
        ).done(function(data)
        {
            console.log("search done");

            if (data.length == 0)
            {
                var b = document.createElement("DIV");
                b.innerHTML = "<p>&lt; No results found. &gt;<p>";
                a.appendChild(b);
                return;
            }

            var b = document.createElement("DIV");
            b.innerHTML = "<p>"+ data.length +" results found.<p>";
            a.appendChild(b);

            for (var item of data)
            {
                var b = document.createElement("DIV");
                b.innerHTML = "<strong>" + item.login.substr(0, value.length) + "</strong>";
                b.innerHTML += item.login.substr(value.length);
                b.innerHTML += "<input type='hidden' value='" + JSON.stringify(item) + "'>"; 

                //update text field if item in list is clicked
                b.addEventListener("click", function(e)
                {
                    var obj = JSON.parse(this.getElementsByTagName("input")[0].value);
                    textInputElement.value = obj.login;

                    CloseAllLists();
                    ClearResults();
                    
                    var c = document.getElementById("resultDisplay"); 

                    c.innerHTML += "<p> ID: " + obj.id + "</p>";
                    c.innerHTML += "<p> User Login Name: " + obj.login + "</p>";
                    c.innerHTML += "<p> GIT Link: " + "<a href=\"" + obj.html_url + "\">View Link</a></p>";

                    // var keys = Object.keys(obj);
                    // for (var i=0; i<keys.length; i++)
                    // {
                    //     var key = keys[i];
                    //     if (key.includes("url"))
                    //     {
                    //         c.innerHTML += "<p>" + key + " : " + "<a href=\"" + obj[key] + "\">View Link</a></p>";
                    //     }
                    //     else
                    //     {
                    //         c.innerHTML += "<p>" + key + " : " + obj[key] + "</p>";
                    //     }
                    // }              
                });
                a.appendChild(b);
            }
        }
        ).fail(function(data)
        {
            console.log("search fail");
            console.log(data);
            var htmlTag;

            if (!data.responseText || data.responseText.length == 0)
                htmlTag = "<p>The server is currently unavailable.</p>";
            else
                htmlTag = "<p>An error has occurred: " + data.responseText + "<p>";
            htmlTag += "<p>Please try again later.<p>";

            document.getElementById("resultDisplay").innerHTML = htmlTag;
        })
    });

    //handle all keyboard items
    textInputElement.addEventListener("keydown", function(e)
    {
        var listItems = document.getElementById("autocomplete-list");
        if (listItems)
        {
            listItems = listItems.getElementsByTagName("DIV");
        }

        //down arrow key
        if (e.keyCode == 40)
        {
            currentFocus++;
            AddActiveItem(listItems);
        }
        //up arrow key
        else if (e.keyCode == 38)
        {
            currentFocus--;
            AddActiveItem(listItems);
        }
        //enter key
        else if (e.keyCode == 13)
        {
            e.preventDefault();
            if (currentFocus > -1)
            {
                if (listItems)
                    listItems[currentFocus].click();
            }
        }
        
    });

    function AddActiveItem(items)
    {
        if (!items)
        {
            return false;
        }

        RemoveActiveItem(items);

        if (currentFocus >= items.length)
            currentFocus = 0;
        if (currentFocus < 0)
            currentFocus = items.length - 1;
        
        items[currentFocus].classList.add("autocomplete-active");
    }

    function RemoveActiveItem(items)
    {
        for (var i=0 ; i<items.length ; i++)
        {
            items[i].classList.remove("autocomplete-active");
        }
    }

    document.addEventListener("click", function (e)
    {
        CloseAllLists(e.target);
    });
}

function CloseAllLists(item)
{
    var list = document.getElementsByClassName("autocomplete-items");
    var textInputElement = document.getElementById("easySearchText");
    for (var i=0 ; i<list.length ; i++)
    {
        if (item != list[i] && item != textInputElement)
        {
            list[i].parentNode.removeChild(list[i]);
        }
    }
}

function ClearResults()
{
    var display = document.getElementById("resultDisplay");
    display.innerHTML = "";
}

function OnClickToggleAdvanced()
{
    console.log("Click Advanced Search");
    ClearResults();
    var panel = document.getElementById("accordionPanel");
    if (!panel)
    {
        console.log("accordion panel not found.");
        return;
    }

    if (document.getElementById("toggleAdvanced").checked == true)
    {
        console.log ("MODE - advanced search");
        panel.style.display = "block";                
        document.getElementById("easySearchText").value = "";
        document.getElementById("easySearchText").disabled = true;
    }
    else
    {
        console.log("MODE - easy search");
        panel.style.display = "none";
        document.getElementById("easySearchText").value = "";
        document.getElementById("easySearchText").disabled = false;
    }
}

function OnClickAdvancedSearch()
{
    ShowAdvancedSearchResult(1);
}

function ShowAdvancedSearchResult(pageNo)
{
    $.ajax
    (
        {
            url:"http://127.0.0.1:8081/searchRepositories",
            type: "GET",
            dataType: 'json',
            data:
            {
                user: document.getElementById('advUsername').value,
                description: document.getElementById('advDescription').value,
                page:pageNo,
            },
            success: function(result)
            {
                console.log("search success");
            },
            error: function(result)
            {
                console.log("search error");
            }
        }
    ).done(function(data)
    {
        console.log("search done");
        ClearResults();

        var htmlTag;

        if (data.length == 0)
        {
            htmlTag = "<p>&lt; No results found. &gt;<p>";
            document.getElementById("resultDisplay").innerHTML = htmlTag;
            return;
        }

        var startNo = (pageNo -1) * 10 + 1;
        var htmlTag = "<p>Total of " + data.total_count + " records found.</p>"

        htmlTag+="<ol start=\"" + startNo + "\">";
        htmlTag+= GetResultsDisplay(data.items);
        htmlTag+="</ol>";

        htmlTag += "<br><br>"
        htmlTag += GetPaginationDisplay(data.total_count, 10, pageNo);
        
        document.getElementById("resultDisplay").innerHTML = htmlTag;
    }
    ).fail(function(data)
    {
        console.log("search fail");
        console.log(data);
        var htmlTag;

        if (!data.responseText || data.responseText.length == 0)
            htmlTag = "<p>The server is currently unavailable.</p>";
        else
            htmlTag = "<p>An error has occurred: " + data.responseText + "<p>";
        htmlTag += "<p>Please try again later.<p>";

        document.getElementById("resultDisplay").innerHTML = htmlTag;
    })
}

function GetResultsDisplay(items)
{
    var htmlTag = "";
    for (var i=0 ; i<items.length ; i++)
    {
        htmlTag+= "<li>ID: " + items[i].id + 
        "<br>Owner ID: " + items[i].owner.id +
        "<br>Name: " + items[i].name + 
        "<br>Full Name: " + items[i].full_name + 
        "<br>Repository Link: <a href=\"" + items[i].html_url + "\">View Link</a>" +
        "</li><br>"
    }

    return htmlTag;
}

function GetPaginationDisplay(total, perPage, current)
{
    var htmlTag = "";
    htmlTag += "<div class=\"center\">";
    htmlTag += "<div class=\"pagination\" id=\"divPagination\">";

    var pages = total/perPage;
    if (total % perPage > 0)
        pages += 1;
    
    for (var i=1 ; i<=pages ; i++)
    {
        if (i == current)
            htmlTag += "<a href='#' onclick=OnClickBtnPage("+ i +") id=\"page" + i + "\" class=\"active\">" + i + "</a>";
        else
            htmlTag += "<a href='#' onclick=OnClickBtnPage("+ i +") id=\"page" + i + "\">" + i + "</a>";
    }

    htmlTag += "</div>";
    htmlTag += "</div>";
    
    return htmlTag;
}

function OnClickAdvancedClear()
{
    document.getElementById('advUsername').value = "";
    document.getElementById('advDescription').value = "";
    ClearResults();
}

function OnClickBtnPage(page)
{
    console.log("pagination page: " + page + " clicked");
    ShowAdvancedSearchResult(page);
}

